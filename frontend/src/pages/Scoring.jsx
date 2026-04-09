import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Plus,
  Minus,
  AlertCircle,
  X,
  Trophy,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { classApi } from "../api/classApi";
import { weekApi } from "../api/weekApi";
import { criterionApi } from "../api/criterionApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";

const Scoring = () => {
  // --- STATES DỮ LIỆU NỀN TẢNG ---
  const [baseClasses, setBaseClasses] = useState([]); // Chứa danh sách lớp gốc
  const [criteria, setCriteria] = useState({ bonus: [], penalty: [] });
  const [weeksList, setWeeksList] = useState([]); // Danh sách tất cả các tuần

  // --- STATES GIAO DIỆN & BỘ LỌC ---
  const [loading, setLoading] = useState(true);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [displayClasses, setDisplayClasses] = useState([]); // Lớp + Điểm (Đã merge và sort)

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [scoreDetails, setScoreDetails] = useState({});

  // Tính toán trạng thái "Chỉ xem" dựa vào Tuần đang chọn
  const currentSelectedWeek = weeksList.find((w) => w._id === selectedWeekId);
  const isReadOnly = currentSelectedWeek?.isLocked || false;

  // 1. FETCH DỮ LIỆU NỀN (Chỉ chạy 1 lần khi vào trang)
  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const [classesData, criteriaData, weeksData] = await Promise.all([
        classApi.getAll(), // Lấy lớp (Tùy logic BE, có thể truyền filter năm học hiện tại)
        criterionApi.getAll({ isActive: true }),
        weekApi.getAll(),
      ]);

      setBaseClasses(classesData);

      setCriteria({
        bonus: criteriaData.filter((c) => c.type === "bonus"),
        penalty: criteriaData.filter((c) => c.type === "penalty"),
      });

      setWeeksList(weeksData);

      // TỰ ĐỘNG CHỌN TUẦN MẶC ĐỊNH: Ưu tiên tuần đang mở. Nếu không có, lấy tuần mới nhất.
      if (weeksData.length > 0) {
        const openWeek = weeksData.find((w) => !w.isLocked);
        setSelectedWeekId(
          openWeek ? openWeek._id : weeksData[weeksData.length - 1]._id,
        );
      }
    } catch (error) {
      toast.error("Lỗi khi tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  // 2. FETCH BẢNG ĐIỂM (Chạy mỗi khi đổi Tuần ở Dropdown hoặc Lưu/Xóa điểm)
  const fetchScoresForWeek = async (weekId) => {
    if (!weekId || baseClasses.length === 0) return;

    try {
      const rankingData = await weeklyScoreApi.getRankingByWeek(weekId);

      // Ghép điểm vào mảng Lớp gốc
      const mergedClasses = baseClasses.map((cls) => {
        const classScore = rankingData.find(
          (score) => score.classId._id === cls._id,
        );
        return {
          ...cls,
          scoreRecord: classScore || null,
        };
      });

      // Thuật toán Sắp xếp (Sort) như cũ
      const sortedClasses = mergedClasses.sort((a, b) => {
        if (a.scoreRecord && b.scoreRecord)
          return b.scoreRecord.totalScore - a.scoreRecord.totalScore;
        if (a.scoreRecord && !b.scoreRecord) return -1;
        if (!a.scoreRecord && b.scoreRecord) return 1;
        return 0;
      });

      setDisplayClasses(sortedClasses);
    } catch (error) {
      toast.error("Lỗi khi tải bảng điểm của tuần này");
    }
  };

  // Lắng nghe sự thay đổi của Tuần được chọn
  useEffect(() => {
    fetchScoresForWeek(selectedWeekId);
  }, [selectedWeekId, baseClasses]);

  // --- ACTIONS ---
  const openScoringModal = (cls) => {
    if (isReadOnly) return; // Chặn cứng không cho mở Modal nếu tuần đã khóa

    setSelectedClass(cls);
    if (cls.scoreRecord) {
      const existingDetails = {};
      cls.scoreRecord.details.forEach((item) => {
        existingDetails[item.criterionId._id || item.criterionId] =
          item.quantity;
      });
      setScoreDetails(existingDetails);
    } else {
      setScoreDetails({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setScoreDetails({});
  };

  const updateQuantity = (criterionId, amount) => {
    setScoreDetails((prev) => {
      const currentQty = prev[criterionId] || 0;
      const newQty = Math.max(0, currentQty + amount);
      const newDetails = { ...prev };
      if (newQty === 0) delete newDetails[criterionId];
      else newDetails[criterionId] = newQty;
      return newDetails;
    });
  };

  const handleManualInput = (criterionId, value) => {
    setScoreDetails((prev) => {
      const newDetails = { ...prev };
      if (value === "" || isNaN(value) || parseInt(value) <= 0)
        delete newDetails[criterionId];
      else newDetails[criterionId] = parseInt(value);
      return newDetails;
    });
  };

  const handleSaveScore = async () => {
    try {
      const detailsArray = Object.keys(scoreDetails).map((key) => ({
        criterionId: key,
        quantity: scoreDetails[key],
      }));

      const payload = {
        classId: selectedClass._id,
        weekId: selectedWeekId, // Lưu vào tuần đang chọn
        details: detailsArray,
      };

      await weeklyScoreApi.saveScore(payload);
      toast.success(`Đã lưu điểm cho lớp ${selectedClass.name}`);
      closeModal();
      fetchScoresForWeek(selectedWeekId); // Chỉ re-fetch bảng điểm, không tải lại cấu hình
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu điểm");
    }
  };

  const handleDeleteScore = async (e, scoreId) => {
    e.stopPropagation();
    if (isReadOnly) {
      toast.error("Tuần này đã khóa, không thể xóa điểm!");
      return;
    }

    if (
      window.confirm(
        "Bạn có chắc muốn xóa điểm của lớp này? Trạng thái sẽ về 'Chưa chấm'.",
      )
    ) {
      try {
        await weeklyScoreApi.deleteScore(scoreId);
        toast.success("Đã reset điểm lớp về trạng thái Chưa chấm");
        fetchScoresForWeek(selectedWeekId);
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi xóa điểm");
      }
    }
  };

  const renderCriterionRow = (c) => {
    const qty = scoreDetails[c._id] || 0;
    return (
      <div
        key={c._id}
        className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100"
      >
        <div className="flex flex-col flex-1 pr-4">
          <span className="font-medium text-gray-800 text-sm leading-tight">
            {c.name}
          </span>
          <span
            className={`text-xs font-bold mt-1 ${c.point > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {c.point > 0 ? `+${c.point}` : c.point} đ / lần
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => updateQuantity(c._id, -1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            min="0"
            value={qty === 0 ? "" : qty}
            onChange={(e) => handleManualInput(c._id, e.target.value)}
            placeholder="0"
            className="w-10 h-7 text-center font-bold text-gray-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded placeholder-gray-300"
            style={{ MozAppearance: "textfield" }}
          />
          <button
            onClick={() => updateQuantity(c._id, 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Đang thiết lập bàn chấm điểm...
      </div>
    );

  if (weeksList.length === 0)
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Chưa có Tuần thi đua nào được tạo!
        </h2>
        <p className="text-gray-500">
          Vui lòng vào mục Quản lý Tuần để tạo tuần thi đua đầu tiên.
        </p>
      </div>
    );

  return (
    <div className="font-sans">
      {/* 1. HEADER & DROPDOWN LỌC TUẦN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Chấm điểm thi đua
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chọn tuần để xem hoặc chấm điểm.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Đang xem:
            </span>
            <select
              value={selectedWeekId}
              onChange={(e) => setSelectedWeekId(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {weeksList.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} {w.isLocked ? "(Đã khóa)" : "(Đang mở)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. CẢNH BÁO CHẾ ĐỘ CHỈ XEM (READ-ONLY) */}
      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Chế độ Chỉ xem (Tuần đã khóa sổ)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Tuần này đã được chốt sổ. Bạn có thể xem kết quả xếp hạng nhưng{" "}
              <strong>không thể thêm, sửa, hoặc xóa</strong> điểm của các lớp.
              Nếu cần thay đổi, hãy yêu cầu Admin mở khóa tuần này.
            </p>
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH LỚP (BẢNG XẾP HẠNG) */}
      <div className="flex flex-col gap-4">
        {displayClasses.map((cls, index) => {
          const isScored = !!cls.scoreRecord;
          const rank = index + 1;

          return (
            <div
              key={cls._id}
              // Chặn click nếu ReadOnly
              onClick={() => !isReadOnly && openScoringModal(cls)}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all 
                ${
                  isScored
                    ? "bg-white border-green-200"
                    : "bg-gray-50 border-gray-200 opacity-80"
                }
                ${
                  isReadOnly
                    ? "cursor-default"
                    : "cursor-pointer hover:shadow-md hover:border-blue-400"
                }
              `}
            >
              {/* Bên trái: Hạng & Thông tin lớp */}
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div
                  className={`w-14 h-14 shrink-0 flex flex-col items-center justify-center rounded-xl font-black text-lg
                  ${
                    !isScored
                      ? "bg-gray-200 text-gray-400"
                      : rank === 1
                        ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                        : rank === 2
                          ? "bg-gray-200 text-gray-600 border border-gray-300"
                          : rank === 3
                            ? "bg-orange-100 text-orange-600 border border-orange-300"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                  }
                `}
                >
                  {isScored ? (
                    <>
                      {rank <= 3 && <Trophy size={14} className="mb-0.5" />}
                      <span>#{rank}</span>
                    </>
                  ) : (
                    <span>--</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {cls.name}
                    </h3>
                    {isScored ? (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                        <CheckCircle2 size={12} /> Đã chấm
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
                        <Clock size={12} /> Chưa chấm
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Khối {cls.grade}</div>
                </div>
              </div>

              {/* Bên phải: Tổng điểm & Action */}
              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:pl-6 sm:border-l border-gray-100 min-w-[200px]">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-gray-500 block mb-0.5">
                    Tổng điểm
                  </span>
                  <span
                    className={`text-2xl font-black ${isScored ? (cls.scoreRecord.totalScore >= 0 ? "text-green-600" : "text-red-600") : "text-gray-300"}`}
                  >
                    {isScored ? cls.scoreRecord.totalScore : "Chưa có"}
                  </span>
                </div>

                <div className="ml-6 flex gap-2">
                  {/* Nếu ReadOnly -> Ẩn toàn bộ nút sửa xóa, hiển thị nhãn Đã khóa */}
                  {isReadOnly ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                      <Lock size={14} /> Chốt sổ
                    </span>
                  ) : isScored ? (
                    <>
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Sửa điểm"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteScore(e, cls.scoreRecord._id)
                        }
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors z-10 relative"
                        title="Xóa / Reset về Chưa chấm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                      Bấm để chấm
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL CHẤM ĐIỂM (Giữ nguyên như cũ) */}
      {isModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Chấm điểm lớp{" "}
                  <span className="text-blue-600 text-2xl ml-1">
                    {selectedClass?.name}
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  {currentSelectedWeek?.name}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-800 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Cột Vi Phạm */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-red-100 shadow-sm h-fit">
                  <h4 className="flex items-center gap-2 font-bold text-red-600 mb-4 pb-3 border-b border-red-50 text-lg">
                    <AlertCircle size={20} /> LỖI VI PHẠM (ĐIỂM TRỪ)
                  </h4>
                  <div className="flex flex-col gap-1">
                    {criteria.penalty.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        Không có tiêu chí điểm trừ.
                      </p>
                    ) : null}
                    {criteria.penalty.map(renderCriterionRow)}
                  </div>
                </div>

                {/* Cột Khen Thưởng */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-green-100 shadow-sm h-fit">
                  <h4 className="flex items-center gap-2 font-bold text-green-600 mb-4 pb-3 border-b border-green-50 text-lg">
                    <CheckCircle2 size={20} /> KHEN THƯỞNG (ĐIỂM CỘNG)
                  </h4>
                  <div className="flex flex-col gap-1">
                    {criteria.bonus.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        Không có tiêu chí điểm cộng.
                      </p>
                    ) : null}
                    {criteria.bonus.map(renderCriterionRow)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-white rounded-b-xl flex justify-between items-center shrink-0">
              <p className="text-sm text-gray-500 italic hidden sm:block">
                Tổng điểm sẽ được hệ thống tính tự động.
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={closeModal}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveScore}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
                >
                  XÁC NHẬN LƯU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;
