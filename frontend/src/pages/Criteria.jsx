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
  Tag,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { criterionApi } from "../api/criterionApi";

// 1. TÁCH THÀNH 2 MẢNG DANH MỤC ĐỘNG VÀ ĐÁNH SỐ THỨ TỰ
const WEEK_CATEGORIES = [
  "1. XẾP HÀNG",
  "2. ĐỒNG PHỤC",
  "3. GIỜ GIẤC - SĨ SỐ",
  "4. NÓI TỤC, VÔ LỄ, ĐÁNH NHAU",
  "5. VỆ SINH",
  "6. HỌC TẬP (SỔ ĐẦU BÀI)",
  "7. NỘI DUNG SINH HOẠT",
  "8. CHĂM SÓC CÂY XANH",
  "9. CHẤP HÀNH PHÁP LUẬT",
  "Khác",
];

const MONTH_CATEGORIES = [
  "1. LAO ĐỘNG",
  "2. THAM GIA TRÒ CHƠI, HỘI THI",
  "3. THAM GIA CUỘC THI DO HĐĐ PHÁT ĐỘNG",
  "Khác",
];

const Criteria = () => {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "penalty",
    point: "",
    category: WEEK_CATEGORIES[0],
    scope: "week",
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

  const filteredAndSortedCriteria = criteria
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category &&
          c.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      // Ưu tiên 1: Sắp xếp theo Phạm vi (Tuần trước, Tháng sau)
      const scopeA = a.scope || "week";
      const scopeB = b.scope || "week";

      if (scopeA === "week" && scopeB === "month") return -1;
      if (scopeA === "month" && scopeB === "week") return 1;

      // Ưu tiên 2: Nếu cùng một phạm vi, tiếp tục sắp xếp theo Danh mục
      const catA = a.category || "";
      const catB = b.category || "";
      return catA.localeCompare(catB);
    });

  const totalPages = Math.ceil(filteredAndSortedCriteria.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredAndSortedCriteria.slice(
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
        category:
          item.category ||
          (item.scope === "month" ? MONTH_CATEGORIES[0] : WEEK_CATEGORIES[0]),
        scope: item.scope || "week",
        isActive: item.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        type: "penalty",
        point: "",
        category: WEEK_CATEGORIES[0],
        scope: "week",
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
    if (!formData.name.trim() || formData.point === "") {
      toast.warning("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      const dataToSubmit = { ...formData, point: Number(formData.point) };
      if (editingId) {
        await criterionApi.update(editingId, dataToSubmit);
        toast.success("Cập nhật thành công");
      } else {
        await criterionApi.create(dataToSubmit);
        toast.success("Thêm mới thành công");
      }
      closeModal();
      fetchCriteria();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tiêu chí này?")) {
      try {
        await criterionApi.delete(id);
        toast.success("Xóa thành công");
        fetchCriteria();
      } catch (error) {
        toast.error("Không thể xóa tiêu chí này");
      }
    }
  };

  // BIẾN XÁC ĐỊNH DANH SÁCH DROPDOWN HIỆN TẠI
  const currentCategoryList =
    formData.scope === "month" ? MONTH_CATEGORIES : WEEK_CATEGORIES;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tiêu chí Thi đua</h2>
          <p className="text-sm text-gray-500 mt-1">
            Chuẩn hóa danh mục chấm điểm Tuần & Tháng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tên hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
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
              <th className="px-6 py-4 font-medium">Danh mục</th>
              <th className="px-6 py-4 font-medium">Phạm vi</th>
              <th className="px-6 py-4 font-medium">Mức điểm</th>
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
                  Chưa có dữ liệu.
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
                  <td
                    className="px-6 py-4 font-medium text-gray-800 max-w-[200px] md:max-w-[300px] truncate"
                    title={c.name}
                  >
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 italic w-max">
                      <Tag size={12} /> {c.category || "Khác"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.scope === "week" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}
                    >
                      {c.scope === "week" ? "Chấm Tuần" : "Chấm Tháng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    <span
                      className={
                        c.point > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {c.point > 0 ? `+${c.point}` : c.point}
                    </span>
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

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span>{" "}
            đến{" "}
            <span className="font-medium text-gray-900 ">
              {Math.min(
                startIndex + itemsPerPage,
                filteredAndSortedCriteria.length,
              )}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900">
              {filteredAndSortedCriteria.length}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Tiêu chí" : "Thêm Tiêu chí Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Phạm vi áp dụng
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => {
                      const newScope = e.target.value;
                      setFormData({
                        ...formData,
                        scope: newScope,
                        category:
                          newScope === "month"
                            ? MONTH_CATEGORIES[0]
                            : WEEK_CATEGORIES[0],
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white text-sm cursor-pointer"
                  >
                    <option value="week">Chấm hàng tuần</option>
                    <option value="month">Chấm phong trào tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Loại tiêu chí
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white text-sm cursor-pointer"
                  >
                    <option value="penalty">Điểm trừ (Vi phạm)</option>
                    <option value="bonus">Điểm cộng (Khen thưởng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Danh mục nhóm
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white text-sm cursor-pointer"
                >
                  {currentCategoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tên tiêu chí
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                  placeholder="VD: Không đeo khăn quàng, Lao động không đạt..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Mức điểm
                  </label>
                  <input
                    type="number"
                    value={formData.point}
                    onChange={(e) =>
                      setFormData({ ...formData, point: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                    placeholder={
                      formData.type === "penalty" ? "VD: -5" : "VD: 10"
                    }
                  />
                </div>
                <div className="pb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Đang hoạt động
                    </span>
                  </label>
                </div>
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

export default Criteria;
