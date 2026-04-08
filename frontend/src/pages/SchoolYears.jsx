import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { schoolYearApi } from "../api/schoolYearApi";

const SchoolYears = () => {
  // 1. Quản lý State
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State cho Form
  const [formData, setFormData] = useState({ name: "", isCurrent: false });

  // State cho Tìm kiếm & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Fetch dữ liệu khi load trang
  const fetchYears = async () => {
    try {
      setLoading(true);
      const data = await schoolYearApi.getAll();
      setYears(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách năm học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  // 3. Logic Tìm kiếm & Phân trang (Xử lý Client-side)
  const filteredYears = years.filter((year) =>
    year.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredYears.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredYears.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Khi người dùng gõ tìm kiếm, tự động reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 4. Xử lý mở Modal
  const openModal = (year = null) => {
    if (year) {
      setEditingId(year._id);
      setFormData({ name: year.name, isCurrent: year.isCurrent });
    } else {
      setEditingId(null);
      setFormData({ name: "", isCurrent: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", isCurrent: false });
  };

  // 5. Xử lý Lưu (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên năm học");
      return;
    }

    try {
      if (editingId) {
        await schoolYearApi.update(editingId, formData);
        toast.success("Cập nhật năm học thành công");
      } else {
        await schoolYearApi.create(formData);
        toast.success("Thêm năm học mới thành công");
      }
      closeModal();
      fetchYears(); // Tải lại danh sách sau khi lưu
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  // 6. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa năm học này không?")) {
      try {
        await schoolYearApi.delete(id);
        toast.success("Xóa năm học thành công");
        fetchYears();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể xóa năm học này",
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Tiêu đề, Tìm kiếm & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Năm học</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách các năm học của trường.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Thanh tìm kiếm */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm năm học..."
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
            <span>Thêm Năm Học</span>
          </button>
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium">STT</th>
              <th className="px-6 py-4 font-medium">Tên năm học</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy kết quả nào."
                    : "Chưa có dữ liệu năm học."}
                </td>
              </tr>
            ) : (
              currentItems.map((year, index) => (
                <tr
                  key={year._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {year.name}
                  </td>
                  <td className="px-6 py-4">
                    {year.isCurrent ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Năm hiện tại
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Năm cũ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(year)}
                      className="text-gray-400 hover:text-blue-600 mx-2 transition-colors"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(year._id)}
                      className="text-gray-400 hover:text-red-500 mx-2 transition-colors"
                      title="Xóa"
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

      {/* Thanh Phân Trang */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span>{" "}
            đến{" "}
            <span className="font-medium text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredYears.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium text-gray-900">
              {filteredYears.length}
            </span>{" "}
            kết quả
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
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
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Năm học" : "Thêm Năm học mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên năm học (VD: 2025-2026)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                  placeholder="Nhập tên năm học..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) =>
                      setFormData({ ...formData, isCurrent: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Đặt làm Năm học hiện tại
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  (Hệ thống sẽ tự động tắt các năm học khác đi).
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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

export default SchoolYears;
