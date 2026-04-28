import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { categoryApi } from "../api/categoryApi";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    scope: "week",
    description: "",
    isActive: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc và tìm kiếm
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Phân trang
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        name: item.name,
        scope: item.scope || "week",
        description: item.description || "",
        isActive: item.isActive !== undefined ? item.isActive : true,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        scope: "week",
        description: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingId) {
        await categoryApi.update(editingId, formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryApi.create(formData);
        toast.success("Thêm danh mục mới thành công");
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.delete(id);
        toast.success("Xóa thành công");
        fetchCategories();
      } catch (error) {
        toast.error("Không thể xóa danh mục này, có thể nó đang được sử dụng");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-blue-600" size={24} /> Quản lý Danh mục
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Phân loại các nhóm tiêu chí cho chấm điểm Tuần & Tháng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tên danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Plus size={20} />
            <span>Thêm Danh mục</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium">STT</th>
              <th className="px-6 py-4 font-medium">Tên Danh mục</th>
              <th className="px-6 py-4 font-medium">Phạm vi</th>
              <th className="px-6 py-4 font-medium">Mô tả</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu danh mục.
                </td>
              </tr>
            ) : (
              currentItems.map((c, index) => (
                <tr
                  key={c._id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !c.isActive ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        c.scope === "week"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }`}
                    >
                      {c.scope === "week" ? "Chấm Tuần" : "Chấm Tháng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic max-w-[200px] truncate">
                    {c.description || "---"}
                  </td>
                  <td className="px-6 py-4">
                    {c.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold w-max">
                        <CheckCircle2 size={14} /> Hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs font-bold w-max">
                        <AlertCircle size={14} /> Tạm ngưng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(c)}
                      className="text-gray-400 hover:text-blue-600 mx-2 transition-colors cursor-pointer"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-gray-400 hover:text-red-500 mx-2 transition-colors cursor-pointer"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span>{" "}
            đến{" "}
            <span className="font-medium text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredCategories.length)}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900">
              {filteredCategories.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Danh mục" : "Thêm Danh mục Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                  placeholder="VD: 1. NỀ NẾP, 2. HỌC TẬP..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Phạm vi áp dụng
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white text-sm cursor-pointer"
                >
                  <option value="week">Dành cho Chấm hàng tuần</option>
                  <option value="month">Dành cho Phong trào tháng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Mô tả (Tùy chọn)
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm resize-none"
                  placeholder="Ghi chú ngắn về nhóm tiêu chí này..."
                />
              </div>

              <div className="pb-2">
                <label className="flex items-center cursor-pointer w-max">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Cho phép hoạt động
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md cursor-pointer"
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

export default Categories;
