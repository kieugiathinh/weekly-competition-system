import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { weekApi } from "../api/weekApi";
import { schoolYearApi } from "../api/schoolYearApi";

// Hàm hỗ trợ format ngày tháng hiển thị ra bảng (DD/MM/YYYY)
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Hàm hỗ trợ format ngày tháng để nhét vào input type="date" (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const Weeks = () => {
  const [weeks, setWeeks] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Thêm startDate và endDate vào state của Form
  const [formData, setFormData] = useState({
    name: "",
    weekNumber: "",
    startDate: "",
    endDate: "",
    schoolYearId: "",
    isLocked: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [weeksData, yearsData] = await Promise.all([
        weekApi.getAll(),
        schoolYearApi.getAll(),
      ]);
      setWeeks(weeksData);
      setSchoolYears(yearsData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredWeeks = weeks.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredWeeks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredWeeks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openModal = (week = null) => {
    if (week) {
      setEditingId(week._id);
      setFormData({
        name: week.name,
        weekNumber: week.weekNumber,
        startDate: formatDateForInput(week.startDate),
        endDate: formatDateForInput(week.endDate),
        schoolYearId: week.schoolYearId?._id || "",
        isLocked: week.isLocked,
      });
    } else {
      setEditingId(null);
      const currentYear = schoolYears.find((y) => y.isCurrent);
      setFormData({
        name: "",
        weekNumber: "", // Để trống để Backend tự tính
        startDate: "",
        endDate: "",
        schoolYearId: currentYear ? currentYear._id : schoolYears[0]?._id || "",
        isLocked: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      weekNumber: "",
      startDate: "",
      endDate: "",
      schoolYearId: "",
      isLocked: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.schoolYearId
    ) {
      toast.warning(
        "Vui lòng nhập đủ Tên tuần, Ngày bắt đầu/kết thúc và Năm học",
      );
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.warning("Ngày kết thúc phải nằm sau ngày bắt đầu");
      return;
    }

    try {
      const dataToSubmit = { ...formData };

      // Nếu có nhập số thứ tự thì ép kiểu số, nếu không thì xóa key đó để BE tự tính
      if (dataToSubmit.weekNumber) {
        dataToSubmit.weekNumber = Number(dataToSubmit.weekNumber);
      } else {
        delete dataToSubmit.weekNumber;
      }

      if (editingId) {
        await weekApi.update(editingId, dataToSubmit);
        toast.success("Cập nhật tuần thi đua thành công");
      } else {
        await weekApi.create(dataToSubmit);
        toast.success("Thêm tuần mới thành công");
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tuần này? Dữ liệu điểm của tuần này (nếu có) cũng sẽ bị ảnh hưởng.",
      )
    ) {
      try {
        await weekApi.delete(id);
        toast.success("Xóa tuần thành công");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể xóa tuần này");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tuần Thi đua</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thời gian và Khóa/Mở sổ chấm điểm.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tuần (VD: Tuần 1)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Thêm Tuần Mới</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium w-16">STT</th>
              <th className="px-6 py-4 font-medium">Thông tin Tuần</th>
              <th className="px-6 py-4 font-medium">Năm học</th>
              <th className="px-6 py-4 font-medium">Trạng thái (Khóa sổ)</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  {searchTerm ? "Không tìm thấy tuần nào." : "Chưa có dữ liệu."}
                </td>
              </tr>
            ) : (
              currentItems.map((w, index) => (
                <tr
                  key={w._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>

                  {/* CỘT THÔNG TIN TUẦN (Bao gồm Tên, Số thứ tự và Thời gian) */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-600">
                        {w.name}{" "}
                        {/* <span className="text-gray-400 font-normal text-sm ml-1">
                          (Số {w.weekNumber})
                        </span> */}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <CalendarDays size={14} />
                        {formatDateForDisplay(w.startDate)} -{" "}
                        {formatDateForDisplay(w.endDate)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {w.schoolYearId?.name || "Lỗi"}
                  </td>
                  <td className="px-6 py-4">
                    {w.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        <Lock size={14} /> Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        <Unlock size={14} /> Đang mở
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(w)}
                      className="text-gray-400 hover:text-blue-600 mx-2 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(w._id)}
                      className="text-gray-400 hover:text-red-500 mx-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span>{" "}
            đến{" "}
            <span className="font-medium text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredWeeks.length)}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900">
              {filteredWeeks.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Tuần" : "Thêm Tuần Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="flex gap-4 mb-4">
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên tuần
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="VD: Tuần 1, Tuần 2..."
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số thứ tự
                  </label>
                  <input
                    type="number"
                    value={formData.weekNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, weekNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Tự động"
                    min="1"
                  />
                </div>
              </div>

              {/* DÒNG CHỌN NGÀY THÁNG */}
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-gray-700"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-gray-700"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thuộc Năm học
                </label>
                <select
                  value={formData.schoolYearId}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolYearId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                >
                  <option value="" disabled>
                    -- Chọn năm học --
                  </option>
                  {schoolYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.name} {year.isCurrent ? "(Năm hiện tại)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLocked}
                    onChange={(e) =>
                      setFormData({ ...formData, isLocked: e.target.checked })
                    }
                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 cursor-pointer accent-red-600"
                  />
                  <span className="ml-2 font-medium text-red-800">
                    Khóa sổ chấm điểm (Lock)
                  </span>
                </label>
                <p className="text-xs text-red-600/80 mt-2 ml-6">
                  Không ai có thể thêm/sửa điểm của tuần này. (Mở tuần mới sẽ tự
                  động khóa tuần cũ).
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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

export default Weeks;
