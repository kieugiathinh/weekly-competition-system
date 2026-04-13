import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  CalendarDays,
  Lock,
  Unlock,
  CheckSquare,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { monthApi } from "../api/monthApi";
import { schoolYearApi } from "../api/schoolYearApi";
import { weekApi } from "../api/weekApi";

const Months = () => {
  const [months, setMonths] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [allWeeks, setAllWeeks] = useState([]);

  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    schoolYearId: "",
    weekIds: [],
    isLocked: false,
  });

  const currentYearObj = schoolYears.find((y) => y._id === selectedYearId);
  const isPastYear = currentYearObj && !currentYearObj.isCurrent;

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [yearsData, weeksData] = await Promise.all([
          schoolYearApi.getAll(),
          weekApi.getAll(),
        ]);
        setSchoolYears(yearsData);
        setAllWeeks(weeksData);

        if (yearsData.length > 0) {
          const currentYear =
            yearsData.find((y) => y.isCurrent) || yearsData[0];
          setSelectedYearId(currentYear._id);
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu hệ thống");
      }
    };
    fetchInitData();
  }, []);

  const fetchMonths = async () => {
    if (!selectedYearId) return;
    try {
      setLoading(true);
      const data = await monthApi.getAll({ schoolYearId: selectedYearId });
      setMonths(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Tháng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonths();
  }, [selectedYearId]);

  const filteredMonths = months.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (item = null) => {
    if (isPastYear) return;

    if (item) {
      setEditingId(item._id);
      setFormData({
        name: item.name,
        schoolYearId: item.schoolYearId?._id || item.schoolYearId,
        weekIds: item.weekIds.map((w) => w._id),
        isLocked: item.isLocked,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        schoolYearId: selectedYearId || schoolYears[0]?._id || "",
        weekIds: [],
        isLocked: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const availableWeeksForForm = allWeeks.filter((w) => {
    const weekYearId = w.schoolYearId?._id || w.schoolYearId;
    return weekYearId === formData.schoolYearId;
  });

  const handleWeekToggle = (weekId) => {
    setFormData((prev) => {
      const isSelected = prev.weekIds.includes(weekId);
      if (isSelected) {
        return { ...prev, weekIds: prev.weekIds.filter((id) => id !== weekId) };
      } else {
        return { ...prev, weekIds: [...prev.weekIds, weekId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.schoolYearId) {
      toast.warning("Vui lòng nhập tên Tháng và chọn Năm học");
      return;
    }

    try {
      if (editingId) {
        await monthApi.update(editingId, formData);
        toast.success("Cập nhật Tháng thành công");
      } else {
        await monthApi.create(formData);
        toast.success("Tạo Tháng mới thành công");
      }
      closeModal();
      fetchMonths();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu Tháng");
    }
  };

  const handleDelete = async (id) => {
    if (isPastYear) return;
    if (
      window.confirm(
        "CẢNH BÁO: Xóa tháng này sẽ làm mất Bảng điểm Tháng của các lớp. Bạn có chắc chắn?",
      )
    ) {
      try {
        await monthApi.delete(id);
        toast.success("Đã xóa Tháng");
        fetchMonths();
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể xóa Tháng này");
      }
    }
  };

  const toggleLock = async (id, currentStatus) => {
    if (isPastYear) return;

    const confirmMessage = currentStatus
      ? "Bạn có chắc chắn muốn MỞ KHÓA tháng này không?"
      : "Bạn có chắc chắn muốn KHÓA SỔ tháng này không? (Mọi dữ liệu điểm tháng sẽ bị chốt)";

    if (!window.confirm(confirmMessage)) return;

    try {
      await monthApi.update(id, { isLocked: !currentStatus });
      toast.success(
        !currentStatus ? "Đã khóa sổ Tháng này" : "Đã mở khóa Tháng này",
      );
      fetchMonths();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi thay đổi trạng thái",
      );
    }
  };

  return (
    <div className="font-sans space-y-6 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Quản lý Tháng Thi Đua
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gom nhóm các Tuần để tính điểm phong trào cấp Tháng.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            Năm học:
          </span>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {schoolYears.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name} {y.isCurrent ? "(Hiện tại)" : "(Cũ)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isPastYear && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Dữ liệu Năm học cũ (Chỉ xem)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Bạn đang xem dữ liệu của một năm học đã kết thúc. Toàn bộ các
              Tháng đã được hệ thống khóa sổ. Bạn không thể thêm, sửa, hay xóa
              bất kỳ dữ liệu nào tại đây.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên tháng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {!isPastYear && (
            <button
              onClick={() => openModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm cursor-pointer"
            >
              <Plus size={18} /> Thêm Tháng
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/30">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : filteredMonths.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {searchTerm
                  ? "Không tìm thấy kết quả nào."
                  : "Chưa có dữ liệu Tháng cho Năm học này."}
              </p>
            </div>
          ) : (
            filteredMonths.map((month) => (
              <div
                key={month._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${month.isLocked ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}
                    >
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {month.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {month.weekIds.length} Tuần
                      </p>
                    </div>
                  </div>

                  {/* ẨN NÚT SỬA/XÓA NẾU THÁNG ĐÃ KHÓA */}
                  {!isPastYear && !month.isLocked && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(month)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(month._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                    <CheckSquare size={16} className="text-blue-500" /> Các tuần
                    bao gồm:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {month.weekIds.length > 0 ? (
                      month.weekIds.map((w) => (
                        <span
                          key={w._id}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200"
                        >
                          {w.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Chưa có tuần nào
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleLock(month._id, month.isLocked)}
                    disabled={isPastYear}
                    className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors border cursor-pointer
                      ${
                        month.isLocked
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }
                      ${isPastYear ? "cursor-default opacity-80" : "hover:shadow-sm"}
                    `}
                  >
                    {month.isLocked ? (
                      <>
                        <Lock size={16} /> Đã khóa sổ
                      </>
                    ) : (
                      <>
                        <Unlock size={16} /> Đang mở chấm điểm
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && !isPastYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? "Cập nhật Tháng" : "Tạo Tháng Mới"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Thiết lập các tuần cho tháng thi đua.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên Tháng
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors font-medium"
                      placeholder="VD: Tháng 9..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Năm học
                    </label>
                    <select
                      value={formData.schoolYearId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schoolYearId: e.target.value,
                          weekIds: [],
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-gray-600 cursor-not-allowed"
                      disabled
                    >
                      {schoolYears.map((y) => (
                        <option key={y._id} value={y._id}>
                          {y.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                    <span>Chọn các Tuần thuộc Tháng này</span>
                    <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md text-xs font-bold border border-blue-100">
                      Đã chọn: {formData.weekIds.length}
                    </span>
                  </label>
                  <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 max-h-52 overflow-y-auto custom-scrollbar">
                    {availableWeeksForForm.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4 italic">
                        Năm học này chưa có Tuần nào được tạo.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableWeeksForForm.map((week) => (
                          <label
                            key={week._id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              formData.weekIds.includes(week._id)
                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.weekIds.includes(week._id)}
                              onChange={() => handleWeekToggle(week._id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span
                              className={`text-sm font-bold ${
                                formData.weekIds.includes(week._id)
                                  ? "text-blue-800"
                                  : "text-gray-700"
                              }`}
                            >
                              {week.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Months;
