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
} from "lucide-react";
import { toast } from "sonner";
import { classApi } from "../api/classApi";
import { weekApi } from "../api/weekApi";
import { criterionApi } from "../api/criterionApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";

const Scoring = () => {
  // --- STATES ---
  const [activeWeek, setActiveWeek] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [criteria, setCriteria] = useState({ bonus: [], penalty: [] });
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  // details sẽ lưu dưới dạng Object: { [criterionId]: quantity }
  const [scoreDetails, setScoreDetails] = useState({});

  // --- FETCH DATA ---
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // 1. Lấy tất cả Tuần, tìm Tuần đang MỞ (isLocked: false) và của Năm hiện tại
      const weeksData = await weekApi.getAll();
      const currentOpenWeek = weeksData.find(
        (w) => !w.isLocked && w.schoolYearId?.isCurrent,
      );

      if (!currentOpenWeek) {
        setActiveWeek(null);
        setLoading(false);
        return; // Dừng lại nếu không có tuần nào mở
      }
      setActiveWeek(currentOpenWeek);

      // 2. Lấy Danh sách Lớp, Tiêu chí (chỉ lấy cái đang Active), và Bảng điểm của Tuần đang mở
      const [classesData, criteriaData, rankingData] = await Promise.all([
        classApi.getAll({ schoolYearId: currentOpenWeek.schoolYearId._id }), // Lấy lớp của năm hiện tại
        criterionApi.getAll({ isActive: true }),
        weeklyScoreApi.getRankingByWeek(currentOpenWeek._id),
      ]);

      // Phân loại Tiêu chí thành 2 cột Cộng / Trừ
      setCriteria({
        bonus: criteriaData.filter((c) => c.type === "bonus"),
        penalty: criteriaData.filter((c) => c.type === "penalty"),
      });

      // 3. THUẬT TOÁN MERGE: Gắn điểm vào Lớp
      const mergedClasses = classesData.map((cls) => {
        const classScore = rankingData.find(
          (score) => score.classId._id === cls._id,
        );
        return {
          ...cls,
          scoreRecord: classScore || null, // Nếu có classScore -> Đã chấm. Nếu null -> Chưa chấm
        };
      });

      setClassesList(mergedClasses);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu chấm điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- ACTIONS ---
  const openScoringModal = (cls) => {
    setSelectedClass(cls);

    // Nếu lớp này ĐÃ CHẤM, load lại số lượng lỗi cũ vào Form
    if (cls.scoreRecord) {
      const existingDetails = {};
      cls.scoreRecord.details.forEach((item) => {
        existingDetails[item.criterionId] = item.quantity;
      });
      setScoreDetails(existingDetails);
    } else {
      // Chưa chấm thì Form trống
      setScoreDetails({});
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setScoreDetails({});
  };

  // Tăng/Giảm số lượng lỗi
  const updateQuantity = (criterionId, amount) => {
    setScoreDetails((prev) => {
      const currentQty = prev[criterionId] || 0;
      const newQty = Math.max(0, currentQty + amount); // Không cho âm

      const newDetails = { ...prev };
      if (newQty === 0) {
        delete newDetails[criterionId]; // Bằng 0 thì xóa luôn khỏi payload
      } else {
        newDetails[criterionId] = newQty;
      }
      return newDetails;
    });
  };

  // LƯU ĐIỂM
  const handleSaveScore = async () => {
    try {
      // Chuyển format từ Object { id: quantity } sang Array [{ criterionId, quantity }] để ném cho BE
      const detailsArray = Object.keys(scoreDetails).map((key) => ({
        criterionId: key,
        quantity: scoreDetails[key],
      }));

      const payload = {
        classId: selectedClass._id,
        weekId: activeWeek._id,
        details: detailsArray,
      };

      await weeklyScoreApi.saveScore(payload);
      toast.success(`Đã lưu điểm cho lớp ${selectedClass.name}`);
      closeModal();
      fetchAllData(); // Refresh lại danh sách thẻ
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu điểm");
    }
  };

  // XÓA ĐIỂM (RESET)
  const handleDeleteScore = async (e, scoreId) => {
    e.stopPropagation(); // Ngăn sự kiện click vào thẻ (tránh mở Modal)
    if (
      window.confirm(
        "Bạn có chắc muốn xóa điểm của lớp này? Trạng thái sẽ về 'Chưa chấm'.",
      )
    ) {
      try {
        await weeklyScoreApi.deleteScore(scoreId);
        toast.success("Đã reset điểm lớp về trạng thái Chưa chấm");
        fetchAllData();
      } catch (error) {
        toast.error("Lỗi khi xóa điểm");
      }
    }
  };

  // --- RENDER BỘ ĐẾM TRONG FORM ---
  const renderCriterionRow = (c) => {
    const qty = scoreDetails[c._id] || 0;
    return (
      <div
        key={c._id}
        className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100"
      >
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 text-sm">{c.name}</span>
          <span
            className={`text-xs font-bold ${c.point > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {c.point > 0 ? `+${c.point}` : c.point} đ / lần
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(c._id, -1)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <Minus size={14} />
          </button>
          <span className="w-4 text-center font-bold text-gray-800">{qty}</span>
          <button
            onClick={() => updateQuantity(c._id, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải cấu hình chấm điểm...
      </div>
    );

  if (!activeWeek)
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Chưa có Tuần thi đua nào đang mở!
        </h2>
        <p className="text-gray-500">
          Vui lòng vào mục Quản lý Tuần để tạo tuần mới hoặc mở khóa một tuần
          đang đóng.
        </p>
      </div>
    );

  return (
    <div className="font-sans">
      {/* HEADER PAGE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Chấm điểm thi đua</h2>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-sm text-gray-500">Đang chấm cho:</p>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
            {activeWeek.name}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm">
            Năm học {activeWeek.schoolYearId.name}
          </span>
        </div>
      </div>

      {/* DANH SÁCH THẺ LỚP (GRID LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classesList.map((cls) => (
          <div
            key={cls._id}
            onClick={() => openScoringModal(cls)}
            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md
              ${
                cls.scoreRecord
                  ? "bg-green-50/30 border-green-200 hover:border-green-400"
                  : "bg-white border-gray-200 hover:border-blue-400"
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black text-gray-800">
                  {cls.name}
                </h3>
                <span className="text-sm text-gray-500">Khối {cls.grade}</span>
              </div>

              {cls.scoreRecord ? (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  <CheckCircle2 size={14} /> Đã chấm
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">
                  <Clock size={14} /> Chưa chấm
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">
                  Tổng điểm
                </span>
                <span
                  className={`text-lg font-bold ${cls.scoreRecord ? (cls.scoreRecord.totalScore >= 0 ? "text-green-600" : "text-red-600") : "text-gray-400"}`}
                >
                  {cls.scoreRecord ? cls.scoreRecord.totalScore : "---"}
                </span>
              </div>

              {/* Nếu đã chấm thì hiện Action Edit/Delete */}
              {cls.scoreRecord ? (
                <div className="flex gap-2">
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                    title="Sửa điểm"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteScore(e, cls.scoreRecord._id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded z-10 relative"
                    title="Xóa/Reset"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-medium text-blue-600">
                  Click để chấm
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHẤM ĐIỂM (CHIA 2 CỘT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Chấm điểm lớp{" "}
                  <span className="text-blue-600 text-2xl ml-1">
                    {selectedClass?.name}
                  </span>
                </h3>
                <p className="text-sm text-gray-500">{activeWeek.name}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-800 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (2 Cột) */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột 1: Vi Phạm (Điểm Trừ) */}
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-red-600 mb-4 pb-2 border-b border-red-50">
                    <AlertCircle size={18} /> LỖI VI PHẠM (ĐIỂM TRỪ)
                  </h4>
                  <div className="flex flex-col gap-1">
                    {criteria.penalty.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Không có tiêu chí điểm trừ.
                      </p>
                    ) : null}
                    {criteria.penalty.map(renderCriterionRow)}
                  </div>
                </div>

                {/* Cột 2: Khen Thưởng (Điểm Cộng) */}
                <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                  <h4 className="flex items-center gap-2 font-bold text-green-600 mb-4 pb-2 border-b border-green-50">
                    <CheckCircle2 size={18} /> KHEN THƯỞNG (ĐIỂM CỘNG)
                  </h4>
                  <div className="flex flex-col gap-1">
                    {criteria.bonus.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Không có tiêu chí điểm cộng.
                      </p>
                    ) : null}
                    {criteria.bonus.map(renderCriterionRow)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-200 bg-white rounded-b-xl flex justify-between items-center">
              <p className="text-sm text-gray-500 italic">
                Tổng điểm sẽ được hệ thống tính tự động.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveScore}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
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
