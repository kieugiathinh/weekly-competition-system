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

  // Điểm từ các tuần (lấy từ API ranking tháng)
  const [totalWeekPoint, setTotalWeekPoint] = useState(0);

  // Lưu state ban đầu để so sánh (Dirty check)
  const [initialScoreDetails, setInitialScoreDetails] = useState({});
  const [scoreDetails, setScoreDetails] = useState({}); // { criterionId: quantity }

  // 1. TẢI DỮ LIỆU BAN ĐẦU
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

        // Tìm thông tin lớp trong bảng xếp hạng tháng để lấy điểm tuần và điểm tháng hiện có
        const classRanking = ranking.find((r) => r.classId._id === classId);
        if (classRanking) {
          setTotalWeekPoint(classRanking.totalWeekPoint || 0);

          const details = {};
          if (classRanking.monthlyDetails) {
            classRanking.monthlyDetails.forEach((d) => {
              details[d.criterionId._id || d.criterionId] = d.quantity;
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

  // 2. KIỂM TRA TRẠNG THÁI CHƯA LƯU
  const isDirty =
    JSON.stringify(scoreDetails) !== JSON.stringify(initialScoreDetails);

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

  // 3. LOGIC GOM NHÓM TIÊU CHÍ (SCOPE = MONTH)
  const groupedCriteria = useMemo(() => {
    const groups = criteria.reduce((acc, item) => {
      const cat = item.category || "KHÁC";
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

  // 4. TÍNH TOÁN ĐIỂM
  const monthlyTotal = useMemo(() => {
    return Object.keys(scoreDetails).reduce((total, critId) => {
      const crit = criteria.find((c) => c._id === critId);
      if (!crit) return total;
      return total + crit.point * (scoreDetails[critId] || 0);
    }, 0);
  }, [scoreDetails, criteria]);

  const finalScore = totalWeekPoint + monthlyTotal;

  // 5. THAO TÁC NHẬP LIỆU
  const updateQty = (id, amount) => {
    setScoreDetails((prev) => {
      const newQty = (prev[id] || 0) + amount;
      const next = { ...prev };
      if (newQty <= 0) delete next[id];
      else next[id] = newQty;
      return next;
    });
  };

  const handleManualInput = (id, value) => {
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
      const detailsArray = Object.keys(scoreDetails).map((id) => ({
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
      {/* HEADER TƯƠNG TỰ CÁC TRANG KHÁC NHƯNG DÙNG TÔNG TÍM */}
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
              Phiếu điểm tháng lớp{" "}
              <span className="text-purple-600">{classData?.name}</span>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100 uppercase">
                {monthData?.name}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chấm điểm phong trào và các vi phạm đặc thù trong tháng.
            </p>
          </div>
        </div>

        {/* KHU VỰC THỐNG KÊ ĐIỂM TỔNG HỢP THÁNG */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex-1 lg:flex-none">
            <span className="block text-[10px] text-blue-500 font-bold uppercase tracking-tight">
              Điểm các tuần
            </span>
            <span className="text-xl font-bold text-blue-700">
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
          <div className="bg-purple-600 px-6 py-2 rounded-lg border border-purple-700 flex-1 lg:flex-none shadow-sm shadow-purple-200">
            <span className="block text-[10px] text-purple-100 font-bold uppercase tracking-tight">
              TỔNG KẾT THÁNG
            </span>
            <span className="text-2xl font-black text-white">{finalScore}</span>
          </div>
        </div>
      </div>

      {/* LƯU Ý CHO NGƯỜI DÙNG */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-800">
          Trang này chỉ dùng để nhập các đầu điểm phát sinh trong tháng (Lao
          động, Phong trào, Thi đua...).
          <strong> Điểm các tuần</strong> đã được hệ thống tự động cộng dồn từ
          dữ liệu chấm điểm tuần.
        </p>
      </div>

      {/* DANH SÁCH TIÊU CHÍ THÁNG */}
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
                <CheckCircle2 size={18} className="text-purple-600" />
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
                      className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-purple-50/20 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {crit.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded border ${crit.type === "penalty" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}
                          >
                            {crit.point > 0 ? `+${crit.point}` : crit.point} đ /
                            lần
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit self-start md:self-center focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all">
                        <button
                          onClick={() => updateQty(crit._id, -1)}
                          className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                        >
                          <Minus size={18} />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={qty === 0 ? "" : qty}
                          onChange={(e) =>
                            handleManualInput(crit._id, e.target.value)
                          }
                          placeholder="0"
                          className="w-12 h-9 text-center text-lg font-bold text-purple-600 bg-transparent outline-none"
                        />

                        <button
                          onClick={() => updateQty(crit._id, 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100"
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

      {/* FOOTER CỐ ĐỊNH */}
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
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm flex items-center justify-center gap-2"
            >
              <Save size={18} /> LƯU ĐIỂM THÁNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyScoreInput;
