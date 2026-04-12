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
} from "lucide-react";
import { toast } from "sonner";
import { criterionApi } from "../api/criterionApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";
import { classApi } from "../api/classApi";
import { weekApi } from "../api/weekApi";

const WeeklyScoreInput = () => {
  const { weekId, classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [criteria, setCriteria] = useState([]);

  // Lưu state ban đầu để so sánh xem người dùng đã thay đổi gì chưa
  const [initialScoreDetails, setInitialScoreDetails] = useState({});
  const [scoreDetails, setScoreDetails] = useState({}); // { criterionId: quantity }

  // 1. TẢI DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [allClasses, allWeeks, critData, ranking] = await Promise.all([
          classApi.getAll(),
          weekApi.getAll(),
          criterionApi.getAll({ scope: "week", isActive: true }),
          weeklyScoreApi.getRankingByWeek(weekId),
        ]);

        const cls = allClasses.find((c) => c._id === classId);
        const wk = allWeeks.find((w) => w._id === weekId);

        if (!cls || !wk) {
          throw new Error("Không tìm thấy dữ liệu Lớp hoặc Tuần!");
        }

        setClassData(cls);
        setWeekData(wk);
        setCriteria(critData);

        const existing = ranking.find((r) => r.classId._id === classId);
        if (existing) {
          const details = {};
          existing.details.forEach((d) => {
            details[d.criterionId._id || d.criterionId] = d.quantity;
          });
          setScoreDetails(details);
          setInitialScoreDetails(details); // Lưu lại bản gốc
        }
      } catch (error) {
        console.error("LỖI TẢI DỮ LIỆU CHẤM ĐIỂM:", error);
        toast.error("Lỗi khi tải dữ liệu chấm điểm (Hãy xem console)");
        navigate("/scoring");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [weekId, classId, navigate]);

  // 2. KIỂM TRA TRẠNG THÁI CHƯA LƯU (DIRTY CHECK)
  const isDirty =
    JSON.stringify(scoreDetails) !== JSON.stringify(initialScoreDetails);

  // Cảnh báo khi reload/đóng tab trình duyệt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Yêu cầu của trình duyệt để hiển thị cảnh báo
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Hàm xử lý khi bấm nút Quay lại / Hủy bỏ
  const handleGoBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Bạn có các thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này? Mọi thay đổi sẽ bị mất.",
      );
      if (!confirmLeave) return;
    }
    navigate("/scoring");
  };

  // 3. LOGIC GOM NHÓM TIÊU CHÍ VÀ SẮP XẾP THEO CATEGORY
  const groupedCriteria = useMemo(() => {
    const groups = criteria.reduce((acc, item) => {
      const cat = item.category || "Khác";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    // Sắp xếp các mảng tiêu chí bên trong mỗi danh mục theo Alphabet
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [criteria]);

  // Lấy danh sách các tên danh mục đã được sắp xếp (1. 2. 3...)
  const sortedCategoryNames = useMemo(() => {
    return Object.keys(groupedCriteria).sort((a, b) => a.localeCompare(b));
  }, [groupedCriteria]);

  // 4. TÍNH TỔNG ĐIỂM TẠM TÍNH
  const currentTotal = useMemo(() => {
    return Object.keys(scoreDetails).reduce((total, critId) => {
      const crit = criteria.find((c) => c._id === critId);
      if (!crit) return total;
      return total + crit.point * (scoreDetails[critId] || 0);
    }, 0);
  }, [scoreDetails, criteria]);

  // 5. THAO TÁC CỘNG/TRỪ SỐ LƯỢNG
  const updateQty = (id, amount) => {
    setScoreDetails((prev) => {
      const newQty = (prev[id] || 0) + amount;
      const next = { ...prev };
      if (newQty <= 0) delete next[id];
      else next[id] = newQty;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const detailsArray = Object.keys(scoreDetails).map((id) => ({
        criterionId: id,
        quantity: scoreDetails[id],
      }));

      await weeklyScoreApi.saveScore({
        classId,
        weekId,
        details: detailsArray,
      });

      toast.success("Đã lưu bảng điểm thành công!");
      // Sau khi lưu thành công thì clear trạng thái dirty
      setInitialScoreDetails(scoreDetails);
      navigate("/scoring");
    } catch (error) {
      toast.error("Lỗi khi lưu điểm");
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Đang tải biểu mẫu chấm điểm...
      </div>
    );

  return (
    <div className="font-sans space-y-6 w-full pb-24">
      {/* HEADER TƯƠNG TỰ CÁC TRANG KHÁC */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors border border-transparent hover:border-gray-200"
            title="Quay lại danh sách"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Phiếu điểm Lớp{" "}
              <span className="text-blue-600">{classData?.name}</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                {weekData?.name}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hệ thống sẽ tự động tổng hợp khi bạn bấm lưu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-sm text-gray-500 font-medium uppercase">
            Tổng điểm
          </span>
          <span
            className={`text-2xl font-bold ${currentTotal >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {currentTotal > 0 ? `+${currentTotal}` : currentTotal}
          </span>
        </div>
      </div>

      {/* DANH SÁCH TIÊU CHÍ PHÂN THEO KHỐI (CATEGORY) */}
      <div className="space-y-6">
        {sortedCategoryNames.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
            <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              Chưa có tiêu chí nào được cấu hình cho tuần này.
            </p>
          </div>
        )}

        {sortedCategoryNames.map((categoryName) => (
          <div
            key={categoryName}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Tiêu đề nhóm (Category) */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-800 text-base">
                {categoryName}
              </h3>
            </div>

            {/* Các dòng tiêu chí */}
            <div className="divide-y divide-gray-100">
              {groupedCriteria[categoryName].map((crit) => {
                const qty = scoreDetails[crit._id] || 0;
                return (
                  <div
                    key={crit._id}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{crit.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded border ${crit.type === "penalty" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}
                        >
                          {crit.point > 0 ? `+${crit.point}` : crit.point} đ /
                          lần
                        </span>
                      </div>
                    </div>

                    {/* Khung điều chỉnh số lượng */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit self-start md:self-center">
                      <button
                        onClick={() => updateQty(crit._id, -1)}
                        className="w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <div className="w-12 text-center">
                        <span
                          className={`text-lg font-bold ${qty > 0 ? "text-blue-600" : "text-gray-400"}`}
                        >
                          {qty}
                        </span>
                      </div>
                      <button
                        onClick={() => updateQty(crit._id, 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER CỐ ĐỊNH CHỨA NÚT LƯU (Bám dính vào màn hình) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 transition-all duration-300 lg:pl-[310px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="hidden md:flex text-sm text-gray-500 font-medium items-center gap-1.5">
            {isDirty ? (
              <>
                <AlertCircle size={16} className="text-orange-500" />
                <span className="text-orange-600">
                  Bạn có thay đổi chưa lưu!
                </span>
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
              className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} /> Lưu Bảng Điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScoreInput;
