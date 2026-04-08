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
import { classApi } from "../api/classApi";
import { schoolYearApi } from "../api/schoolYearApi"; // Import API năm học

const Classes = () => {
  // 1. Quản lý State
  const [classes, setClasses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]); // State lưu danh sách năm học cho Dropdown
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State cho Form (Mặc định chọn khối 6)
  const [formData, setFormData] = useState({
    name: "",
    grade: 6,
    schoolYearId: "",
  });

  // State cho Tìm kiếm & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Fetch dữ liệu khi load trang
  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi song song 2 API cho nhanh
      const [classesData, yearsData] = await Promise.all([
        classApi.getAll(),
        schoolYearApi.getAll(),
      ]);
      setClasses(classesData);
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

  // 3. Logic Tìm kiếm & Phân trang
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredClasses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 4. Xử lý mở Modal
  const openModal = (classItem = null) => {
    if (classItem) {
      setEditingId(classItem._id);
      // Backend trả về classItem.schoolYearId là 1 object { _id, name }, ta chỉ lấy _id để gán vào select
      setFormData({
        name: classItem.name,
        grade: classItem.grade,
        schoolYearId: classItem.schoolYearId?._id || "",
      });
    } else {
      setEditingId(null);
      // Khi tạo mới, mặc định chọn Năm học hiện tại (isCurrent: true) nếu có
      const currentYear = schoolYears.find((y) => y.isCurrent);
      setFormData({
        name: "",
        grade: 6,
        schoolYearId: currentYear ? currentYear._id : schoolYears[0]?._id || "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", grade: 6, schoolYearId: "" });
  };

  // 5. Xử lý Lưu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.schoolYearId) {
      toast.warning("Vui lòng nhập tên lớp và chọn năm học");
      return;
    }

    try {
      if (editingId) {
        await classApi.update(editingId, formData);
        toast.success("Cập nhật lớp học thành công");
      } else {
        await classApi.create(formData);
        toast.success("Thêm lớp học mới thành công");
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  // 6. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) {
      try {
        await classApi.delete(id);
        toast.success("Xóa lớp học thành công");
        fetchData();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể xóa lớp học này",
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lớp học</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách lớp và khối.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tên lớp (VD: 6/1)..."
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
            <span>Thêm Lớp Mới</span>
          </button>
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium">STT</th>
              <th className="px-6 py-4 font-medium">Tên lớp</th>
              <th className="px-6 py-4 font-medium">Khối</th>
              <th className="px-6 py-4 font-medium">Năm học</th>
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
                  {searchTerm
                    ? "Không tìm thấy lớp nào."
                    : "Chưa có dữ liệu lớp học."}
                </td>
              </tr>
            ) : (
              currentItems.map((c, index) => (
                <tr
                  key={c._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-gray-800">Khối {c.grade}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.schoolYearId?.name || (
                      <span className="text-red-500 italic">Lỗi năm học</span>
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

      {/* Pagination (Giống hệt SchoolYear) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 gap-4">
          <span className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-medium text-gray-900">{startIndex + 1}</span>{" "}
            đến{" "}
            <span className="font-medium text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredClasses.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium text-gray-900">
              {filteredClasses.length}
            </span>{" "}
            kết quả
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {editingId ? "Cập nhật Lớp học" : "Thêm Lớp Mới"}
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
                  Tên lớp (VD: 6/1, 9A)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Nhập tên lớp..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khối
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                >
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </select>
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

export default Classes;
