import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  ShieldAlert,
  Info,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { criterionApi } from "../api/criterionApi";
import { monthlyScoreApi } from "../api/monthlyScoreApi";
import { classApi } from "../api/classApi";
import { monthApi } from "../api/monthApi";

const MonthlyScoreInput = () => {
  const { monthId, classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [criteria, setCriteria] = useState([]);

  const [totalWeekPoint, setTotalWeekPoint] = useState(0);

  const [initialScoreDetails, setInitialScoreDetails] = useState({});
  const [scoreDetails, setScoreDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [allClasses, allMonths, critData, ranking] = await Promise.all([
          classApi.getAll(),
          monthApi.getAll(),
          criterionApi.getAll({ scope: "month", isActive: true }),
          monthlyScoreApi.getRankingByMonth(monthId),
        ]);

        const cls = allClasses.find((c) => c._id === classId);
        const mon = allMonths.find((m) => m._id === monthId);

        if (!cls || !mon) {
          throw new Error("Không tìm thấy dữ liệu Lớp hoặc Tháng!");
        }

        setClassData(cls);
        setMonthData(mon);
        setCriteria(critData);

        const classRanking = ranking.find((r) => r.classId._id === classId);
        if (classRanking) {
          setTotalWeekPoint(classRanking.totalWeekPoint || 0);

          const details = {};
          if (classRanking.monthlyDetails) {
            classRanking.monthlyDetails.forEach((d) => {
              if (d.criterionId) {
                details[d.criterionId._id || d.criterionId] = d.quantity;
              }
            });
          }
          setScoreDetails(details);
          setInitialScoreDetails(details);
        }
      } catch (error) {
        console.error("LỖI TẢI DỮ LIỆU CHẤM THÁNG:", error);
        toast.error("Lỗi khi tải biểu mẫu chấm điểm tháng");
        navigate("/monthly-scoring");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [monthId, classId, navigate]);

  const isDirty =
    JSON.stringify(scoreDetails) !== JSON.stringify(initialScoreDetails);

  // BIẾN KHÓA SỔ
  const isReadOnly = monthData?.isLocked;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleGoBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Bạn có các thay đổi chưa được lưu. Rời khỏi trang này sẽ mất dữ liệu đã nhập?",
      );
      if (!confirmLeave) return;
    }
    navigate("/monthly-scoring");
  };

  const groupedCriteria = useMemo(() => {
    const groups = criteria.reduce((acc, item) => {
      // CẬP NHẬT: Lấy tên từ object categoryId
      const cat = item.categoryId?.name || "KHÁC";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [criteria]);

  const sortedCategoryNames = useMemo(() => {
    return Object.keys(groupedCriteria).sort((a, b) => a.localeCompare(b));
  }, [groupedCriteria]);

  const monthlyTotal = useMemo(() => {
    return Object.keys(scoreDetails).reduce((total, critId) => {
      const crit = criteria.find((c) => c._id === critId);
      if (!crit) return total;
      return total + crit.point * (scoreDetails[critId] || 0);
    }, 0);
  }, [scoreDetails, criteria]);

  const finalScore = totalWeekPoint + monthlyTotal;

  const updateQty = (id, amount) => {
    if (isReadOnly) return;
    setScoreDetails((prev) => {
      const newQty = (prev[id] || 0) + amount;
      const next = { ...prev };
      if (newQty <= 0) delete next[id];
      else next[id] = newQty;
      return next;
    });
  };

  const handleManualInput = (id, value) => {
    if (isReadOnly) return;
    setScoreDetails((prev) => {
      const next = { ...prev };
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue) || parsedValue <= 0) delete next[id];
      else next[id] = parsedValue;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const detailsArray = Object.keys(scoreDetails)
        .filter((id) => id !== "undefined" && id !== "null")
        .map((id) => ({
          criterionId: id,
          quantity: scoreDetails[id],
        }));

      await monthlyScoreApi.saveScore({
        classId,
        monthId,
        details: detailsArray,
      });

      toast.success(`Đã lưu điểm tháng thành công cho lớp ${classData?.name}`);
      setInitialScoreDetails(scoreDetails);
      navigate("/monthly-scoring");
    } catch (error) {
      toast.error("Lỗi khi lưu điểm tháng");
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Đang tải dữ liệu tháng...
      </div>
    );

  return (
    <div className="font-sans space-y-6 w-full pb-24">
      {/* HEADER ĐỒNG BỘ MÀU XANH */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors border border-transparent hover:border-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Phiếu điểm tháng Lớp{" "}
              <span className="text-blue-600">{classData?.name}</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                {monthData?.name}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chấm điểm phong trào và các vi phạm đặc thù trong tháng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex-1 lg:flex-none">
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-tight">
              Điểm các tuần
            </span>
            <span className="text-xl font-bold text-gray-700">
              {totalWeekPoint}
            </span>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex-1 lg:flex-none">
            <span className="block text-[10px] text-orange-500 font-bold uppercase tracking-tight">
              Điểm phong trào
            </span>
            <span
              className={`text-xl font-bold ${monthlyTotal >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {monthlyTotal > 0 ? `+${monthlyTotal}` : monthlyTotal}
            </span>
          </div>
          <div className="bg-blue-600 px-6 py-2 rounded-lg border border-blue-700 flex-1 lg:flex-none shadow-sm shadow-blue-200">
            <span className="block text-[10px] text-blue-100 font-bold uppercase tracking-tight">
              TỔNG KẾT THÁNG
            </span>
            <span className="text-2xl font-black text-white">{finalScore}</span>
          </div>
        </div>
      </div>

      {/* HIỂN THỊ BANNER CẢNH BÁO NẾU ĐÃ KHÓA */}
      {isReadOnly ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Tháng đã chốt sổ (Chỉ xem)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Tháng này đã khóa, bạn không thể thay đổi dữ liệu điểm.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-blue-800">
            Trang này chỉ dùng để nhập các đầu điểm phát sinh trong tháng (Lao
            động, Phong trào, Thi đua...).
            <strong> Điểm các tuần</strong> đã được hệ thống tự động cộng dồn từ
            dữ liệu chấm điểm tuần.
          </p>
        </div>
      )}

      {/* DANH SÁCH TIÊU CHÍ (CHUNG 1 KHUNG LỚN NHƯ TUẦN) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sortedCategoryNames.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              Chưa có tiêu chí nào được cấu hình cho phạm vi THÁNG.
            </p>
          </div>
        ) : (
          sortedCategoryNames.map((categoryName, index) => (
            <div key={categoryName} className="flex flex-col">
              <div
                className={`bg-gray-50 px-6 py-4 flex items-center gap-2 ${index > 0 ? "border-t border-gray-200" : ""}`}
              >
                <CheckCircle2 size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-base uppercase">
                  {categoryName}
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {groupedCriteria[categoryName].map((crit) => {
                  const qty = scoreDetails[crit._id] || 0;
                  return (
                    <div
                      key={crit._id}
                      className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isReadOnly ? "opacity-80" : "hover:bg-blue-50/30 transition-colors"}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-normal text-gray-800">
                          {crit.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${crit.type === "penalty" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}
                          >
                            {crit.point > 0 ? `+${crit.point}` : crit.point} đ /
                            lần
                          </span>
                        </div>
                      </div>

                      {/* Khung điều chỉnh số lượng (Cho phép nhập tay) */}
                      <div
                        className={`flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit self-start md:self-center ${isReadOnly ? "bg-gray-50" : "focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all"}`}
                      >
                        <button
                          onClick={() => updateQty(crit._id, -1)}
                          disabled={isReadOnly}
                          className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Minus size={18} />
                        </button>

                        <input
                          type="number"
                          min="0"
                          disabled={isReadOnly}
                          value={qty === 0 ? "" : qty}
                          onChange={(e) =>
                            handleManualInput(crit._id, e.target.value)
                          }
                          placeholder="0"
                          className="w-12 h-9 text-center text-lg font-bold text-blue-600 bg-transparent outline-none focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          style={{ MozAppearance: "textfield" }}
                        />

                        <button
                          onClick={() => updateQty(crit._id, 1)}
                          disabled={isReadOnly}
                          className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER CỐ ĐỊNH CHỨA NÚT LƯU */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 transition-all duration-300 lg:pl-[310px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="hidden md:flex text-sm text-gray-500 font-medium items-center gap-1.5">
            {isDirty ? (
              <>
                <AlertCircle size={16} className="text-orange-500" />
                <span className="text-orange-600">Có thay đổi chưa lưu!</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="text-green-500" />
                Dữ liệu đã được đồng bộ.
              </>
            )}
          </p>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleGoBack}
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save size={18} /> Lưu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyScoreInput;
