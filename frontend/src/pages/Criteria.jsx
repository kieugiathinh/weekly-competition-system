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
} from "lucide-react";
import { toast } from "sonner";
import { criterionApi } from "../api/criterionApi";

const Criteria = () => {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Mặc định tạo mới là Điểm trừ (vì trường học đa số là vi phạm)
  const [formData, setFormData] = useState({
    name: "",
    type: "penalty",
    point: "",
    isActive: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const data = await criterionApi.getAll();
      setCriteria(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách tiêu chí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  // Lọc theo cả Tên và Loại tiêu chí
  const filteredCriteria = criteria.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCriteria.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCriteria.slice(
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
        type: item.type,
        point: item.point,
        isActive: item.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", type: "penalty", point: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", type: "penalty", point: "", isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.point === "") {
      toast.warning("Vui lòng nhập đủ tên và mức điểm");
      return;
    }

    const pointValue = Number(formData.point);

    // Validate UX: Cảnh báo nếu nhập sai logic âm dương
    if (formData.type === "penalty" && pointValue > 0) {
      toast.warning("Điểm trừ phải là số âm (VD: -5)");
      return;
    }
    if (formData.type === "bonus" && pointValue < 0) {
      toast.warning("Điểm cộng phải là số dương (VD: 10)");
      return;
    }

    try {
      const dataToSubmit = { ...formData, point: pointValue };
      if (editingId) {
        await criterionApi.update(editingId, dataToSubmit);
        toast.success("Cập nhật tiêu chí thành công");
      } else {
        await criterionApi.create(dataToSubmit);
        toast.success("Thêm tiêu chí mới thành công");
      }
      closeModal();
      fetchCriteria();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Cảnh báo: Nếu bạn xóa cứng, các bảng điểm cũ có tiêu chí này có thể bị lỗi.\n\nKhuyên dùng: Nên bấm 'Sửa' và tắt trạng thái Hoạt động thay vì Xóa.\n\nBạn vẫn muốn tiếp tục xóa?",
      )
    ) {
      try {
        await criterionApi.delete(id);
        toast.success("Xóa tiêu chí thành công");
        fetchCriteria();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể xóa tiêu chí này",
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tiêu chí Thi đua</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các lỗi vi phạm và điểm thưởng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tiêu chí..."
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
            <span>Thêm Tiêu chí</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium">STT</th>
              <th className="px-6 py-4 font-medium">Tên tiêu chí</th>
              <th className="px-6 py-4 font-medium">Phân loại</th>
              <th className="px-6 py-4 font-medium">Mức điểm</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy tiêu chí nào."
                    : "Chưa có dữ liệu."}
                </td>
              </tr>
            ) : (
              currentItems.map((c, index) => (
                <tr
                  key={c._id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!c.isActive ? "opacity-60" : ""}`}
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    {c.type === "bonus" ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle2 size={16} /> Điểm cộng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                        <AlertCircle size={16} /> Điểm trừ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${c.point > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {c.point > 0 ? `+${c.point}` : c.point}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Đang dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Tạm ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(c)}
                      className="text-gray-400 hover:text-blue-600 mx-2 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
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
              {Math.min(startIndex + itemsPerPage, filteredCriteria.length)}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900">
              {filteredCriteria.length}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Tiêu chí" : "Thêm Tiêu chí"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tiêu chí (Lỗi/Khen thưởng)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="VD: Không đeo khăn quàng, Tiết A..."
                />
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại tiêu chí
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                  >
                    <option value="penalty">Điểm trừ</option>
                    <option value="bonus">Điểm cộng</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức điểm
                  </label>
                  <input
                    type="number"
                    value={formData.point}
                    onChange={(e) =>
                      setFormData({ ...formData, point: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    placeholder={
                      formData.type === "penalty" ? "VD: -5" : "VD: 10"
                    }
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Trạng thái hoạt động
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  (Bỏ tick nếu tiêu chí này không còn áp dụng, thay vì xóa nó).
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
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

export default Criteria;
