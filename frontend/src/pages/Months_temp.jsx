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
} from "lucide-react";
import { toast } from "sonner";
import { monthApi } from "../api/monthApi";
import { schoolYearApi } from "../api/schoolYearApi";
import { weekApi } from "../api/weekApi";

const Months = () => {
  const [months, setMonths] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [allWeeks, setAllWeeks] = useState([]); // Lưu tất cả các tuần để chọn

  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    schoolYearId: "",
    weekIds: [], // Mảng chứa ID các tuần
    isLocked: false,
  });

  // 1. Tải danh sách Năm học và Tuần
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

  // 2. Tải danh sách Tháng khi chọn Năm học
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

  // 3. Mở Modal Thêm/Sửa
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        name: item.name,
        schoolYearId: item.schoolYearId._id,
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

  // Lọc ra các Tuần thuộc về Năm học đang được chọn trong Form
  const availableWeeksForForm = allWeeks.filter(
    (w) =>
      w.schoolYearId._id === formData.schoolYearId ||
      w.schoolYearId === formData.schoolYearId,
  );

  // Xử lý Checkbox chọn Tuần
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

  // 4. Submit Form
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
      fetchMonths(); // Reload data
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu Tháng");
    }
  };

  // 5. Xóa Tháng
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "CẢNH BÁO: Xóa tháng này sẽ không làm mất dữ liệu các Tuần bên trong, nhưng sẽ mất Bảng điểm Tháng. Bạn có chắc chắn?",
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Quản lý Tháng Thi Đua
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gom nhóm các Tuần để tính điểm phong trào cấp Tháng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Năm học:</span>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {schoolYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap shadow-sm"
          >
            <Plus size={20} />
            <span>Thêm Tháng</span>
          </button>
        </div>
      </div>

      {/* Danh sách */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : months.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              Chưa có dữ liệu Tháng cho Năm học này.
            </p>
          </div>
        ) : (
          months.map((month) => (
            <div
              key={month._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${month.isLocked ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}
                  >
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {month.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${month.isLocked ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                    >
                      {month.isLocked ? "Đã chốt sổ" : "Đang mở"}
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(month)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(month._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <CheckSquare size={16} className="text-blue-500" /> Các tuần
                  bao gồm ({month.weekIds.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {month.weekIds.length > 0 ? (
                    month.weekIds.map((w) => (
                      <span
                        key={w._id}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                      >
                        {w.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Chưa chọn tuần nào
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Tháng" : "Tạo Tháng Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm border border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Tên Tháng
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium"
                    placeholder="VD: Tháng 9, Tháng 10..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
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
                    } // Đổi năm thì reset chọn tuần
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-gray-50 font-medium"
                  >
                    {schoolYears.map((y) => (
                      <option key={y._id} value={y._id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bảng chọn Tuần */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between items-center">
                  <span>Chọn các Tuần thuộc Tháng này</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Đã chọn: {formData.weekIds.length}
                  </span>
                </label>
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableWeeksForForm.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4 italic">
                      Năm học này chưa có Tuần nào được tạo.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableWeeksForForm.map((week) => (
                        <label
                          key={week._id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${formData.weekIds.includes(week._id) ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:border-blue-300"}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.weekIds.includes(week._id)}
                            onChange={() => handleWeekToggle(week._id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span
                            className={`text-sm font-medium ${formData.weekIds.includes(week._id) ? "text-blue-800" : "text-gray-700"}`}
                          >
                            {week.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) =>
                      setFormData({ ...formData, isLocked: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex flex-col">
                    <span className="text-sm font-bold text-orange-800 flex items-center gap-1">
                      <Lock size={14} /> Chốt sổ Tháng này
                    </span>
                    <span className="text-xs text-orange-600 mt-0.5">
                      Không cho phép sửa đổi điểm sau khi khóa.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
                >
                  Lưu Tháng
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
