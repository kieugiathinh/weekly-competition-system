import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { classApi } from "../api/classApi";
import { schoolYearApi } from "../api/schoolYearApi";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    grade: 6,
    schoolYearId: "",
  });

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await schoolYearApi.getAll();
        setSchoolYears(years);
        if (years.length > 0) {
          const currentYear = years.find((y) => y.isCurrent) || years[0];
          setSelectedYearId(currentYear._id);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách năm học");
      }
    };
    fetchYears();
  }, []);

  const fetchClasses = async (yearId) => {
    if (!yearId) return;
    try {
      setLoading(true);
      const data = await classApi.getAll({ schoolYearId: yearId });
      setClasses(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(selectedYearId);
  }, [selectedYearId]);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (cls = null) => {
    if (cls) {
      setEditingId(cls._id);
      setFormData({
        name: cls.name,
        grade: cls.grade,
        schoolYearId: cls.schoolYearId?._id || selectedYearId,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", grade: 6, schoolYearId: selectedYearId });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Vui lòng nhập tên lớp");

    try {
      if (editingId) {
        await classApi.update(editingId, formData);
        toast.success("Cập nhật lớp thành công");
      } else {
        await classApi.create(formData);
        toast.success("Tạo lớp mới thành công");
      }
      closeModal();
      fetchClasses(selectedYearId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lớp này?")) return;
    try {
      await classApi.delete(id);
      toast.success("Đã xóa lớp");
      fetchClasses(selectedYearId);
    } catch (error) {
      toast.error("Không thể xóa lớp này");
    }
  };

  const handleCloneClasses = async () => {
    const currentIndex = schoolYears.findIndex((y) => y._id === selectedYearId);
    if (currentIndex === -1 || currentIndex === schoolYears.length - 1) {
      return toast.error("Không tìm thấy năm học cũ nào trước đó để sao chép!");
    }

    const prevYear = schoolYears[currentIndex + 1];

    if (
      window.confirm(
        `Bạn có chắc muốn sao chép toàn bộ lớp từ năm học [${prevYear.name}] sang năm học đang chọn không?`,
      )
    ) {
      try {
        setLoading(true);
        await classApi.clone({
          fromYearId: prevYear._id,
          toYearId: selectedYearId,
        });
        toast.success("Đã sao chép thành công danh sách lớp!");
        fetchClasses(selectedYearId);
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi sao chép lớp");
        setLoading(false);
      }
    }
  };

  return (
    <div className="font-sans space-y-6 w-full">
      {/* HEADER & LỌC NĂM HỌC */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Lớp học</h2>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các lớp theo từng năm học.
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
            {schoolYears.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} {w.isCurrent ? "(Hiện tại)" : "(Cũ)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {!loading && classes.length === 0 && schoolYears.length > 1 && (
              <button
                onClick={handleCloneClasses}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                <Copy size={18} /> Sao chép từ năm cũ
              </button>
            )}

            <button
              onClick={() => openModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              <Plus size={18} /> Thêm Lớp
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Tên Lớp</th>
                <th className="px-6 py-4 font-medium">Khối</th>
                <th className="px-6 py-4 font-medium">Năm học</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      Chưa có danh sách lớp cho năm học này.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Bấm "Thêm Lớp" hoặc dùng tính năng Sao chép.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr
                    key={cls._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {cls.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Khối {cls.grade}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-medium">
                        {cls.schoolYearId?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(cls)}
                        className="text-gray-400 hover:text-blue-600 mx-2 cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="text-gray-400 hover:text-red-500 mx-2 cursor-pointer"
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
      </div>

      {/* MODAL THÊM / SỬA (Đã khôi phục UI đẹp) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? "Sửa thông tin Lớp" : "Thêm Lớp mới"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Nhập thông tin lớp học vào bên dưới.
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tên Lớp (VD: 6/1, 6A...)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    placeholder="Nhập tên lớp..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Thuộc Khối
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
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

export default Classes;
