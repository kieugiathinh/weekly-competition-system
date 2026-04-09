import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { weekApi } from "../api/weekApi";
import { schoolYearApi } from "../api/schoolYearApi";

const Weeks = () => {
  const [weeks, setWeeks] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    schoolYearId: "",
  });

  const currentYearObj = schoolYears.find((y) => y._id === selectedYearId);
  const isPastYear = currentYearObj && !currentYearObj.isCurrent;

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

  const fetchWeeks = async (yearId) => {
    if (!yearId) return;
    try {
      setLoading(true);
      const data = await weekApi.getAll({ schoolYearId: yearId });
      setWeeks(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Tuần");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeks(selectedYearId);
  }, [selectedYearId]);

  const filteredWeeks = weeks.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openModal = (week = null) => {
    if (isPastYear) return;

    if (week) {
      setEditingId(week._id);
      setFormData({
        name: week.name,
        startDate: week.startDate ? week.startDate.split("T")[0] : "",
        endDate: week.endDate ? week.endDate.split("T")[0] : "",
        schoolYearId: week.schoolYearId?._id || selectedYearId,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        schoolYearId: selectedYearId,
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
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      return toast.warning("Vui lòng nhập đầy đủ thông tin");
    }

    try {
      if (editingId) {
        await weekApi.update(editingId, formData);
        toast.success("Cập nhật tuần thành công");
      } else {
        // Ép định dạng isLocked: true khi tạo mới
        await weekApi.create({ ...formData, isLocked: true });
        toast.success("Tạo tuần mới thành công (Mặc định: Đã khóa)");
      }
      closeModal();
      fetchWeeks(selectedYearId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (isPastYear) return;
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa Tuần này? Dữ liệu điểm có thể bị ảnh hưởng.",
      )
    )
      return;
    try {
      await weekApi.delete(id);
      toast.success("Đã xóa tuần thi đua");
      fetchWeeks(selectedYearId);
    } catch (error) {
      toast.error("Không thể xóa tuần này");
    }
  };

  const toggleLock = async (id, currentStatus) => {
    if (isPastYear) return;

    // Xác nhận trước khi thay đổi
    const confirmMessage = currentStatus
      ? "Bạn có chắc chắn muốn MỞ KHÓA tuần này không? (Các lớp sẽ có thể nhập và sửa điểm)"
      : "Bạn có chắc chắn muốn KHÓA SỔ tuần này không? (Mọi dữ liệu điểm sẽ bị chốt)";

    if (!window.confirm(confirmMessage)) return;

    try {
      await weekApi.update(id, { isLocked: !currentStatus });
      toast.success(
        !currentStatus ? "Đã khóa sổ tuần này" : "Đã mở khóa tuần này",
      );
      fetchWeeks(selectedYearId);
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  return (
    <div className="font-sans space-y-6 w-full">
      {/* HEADER & LỌC NĂM HỌC */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Quản lý Tuần thi đua
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tạo tuần, cài đặt thời gian và Đóng/Mở sổ.
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

      {/* CẢNH BÁO NĂM CŨ */}
      {isPastYear && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Dữ liệu Năm học cũ (Chỉ xem)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Bạn đang xem dữ liệu của một năm học đã kết thúc. Toàn bộ các Tuần
              đã được hệ thống khóa sổ tự động. Bạn không thể thêm, sửa, hay xóa
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
              placeholder="Tìm tên tuần..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
            />
          </div>

          {!isPastYear && (
            <button
              onClick={() => openModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} /> Thêm Tuần
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Tên Tuần</th>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium">Trạng thái (Khóa/Mở)</th>
                {!isPastYear && (
                  <th className="px-6 py-4 font-medium text-right">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isPastYear ? 3 : 4}
                    className="text-center py-8 text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredWeeks.length === 0 ? (
                <tr>
                  <td
                    colSpan={isPastYear ? 3 : 4}
                    className="text-center py-12 text-gray-500"
                  >
                    Chưa có Tuần thi đua nào cho năm học này.
                  </td>
                </tr>
              ) : (
                filteredWeeks.map((week) => (
                  <tr
                    key={week._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {week.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Từ{" "}
                      <span className="font-medium">
                        {new Date(week.startDate).toLocaleDateString("vi-VN")}
                      </span>{" "}
                      {/* <br /> */}
                      Đến{" "}
                      <span className="font-medium">
                        {new Date(week.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleLock(week._id, week.isLocked)}
                        disabled={isPastYear}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border w-fit cursor-pointer
                          ${
                            week.isLocked
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                          ${isPastYear ? "cursor-default opacity-80" : "hover:shadow-sm"}
                        `}
                      >
                        {week.isLocked ? (
                          <>
                            <Lock size={14} /> Đã khóa
                          </>
                        ) : (
                          <>
                            <Unlock size={14} /> Đang mở
                          </>
                        )}
                      </button>
                    </td>

                    {!isPastYear && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(week)}
                          className="text-gray-400 hover:text-blue-600 mx-2"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(week._id)}
                          className="text-gray-400 hover:text-red-500 mx-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && !isPastYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? "Sửa thông tin Tuần" : "Thêm Tuần mới"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Thiết lập thời gian áp dụng cho tuần.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tên Tuần
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    placeholder="VD: Tuần 1, Tuần 2..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
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
