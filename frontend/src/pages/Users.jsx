import { useState, useEffect } from "react";
import {
  UserPlus,
  Edit,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  // 1. Kéo thêm setUser ra để dùng
  const { user: currentUser, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "user",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openModal = (userItem = null) => {
    if (userItem) {
      setEditingId(userItem._id);
      setFormData({
        name: userItem.name,
        username: userItem.username,
        password: "",
        role: userItem.role || "user",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", username: "", password: "", role: "user" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", username: "", password: "", role: "user" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      toast.warning("Vui lòng nhập đủ Tên hiển thị và Tên đăng nhập");
      return;
    }

    if (!editingId && !formData.password) {
      toast.warning("Vui lòng đặt mật khẩu cho tài khoản mới");
      return;
    }

    try {
      const dataToSubmit = { ...formData };
      if (editingId && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      if (editingId) {
        const updatedUser = await userApi.update(editingId, dataToSubmit);
        toast.success("Cập nhật tài khoản thành công");

        // 2. CHECK VÀ CẬP NHẬT HEADER NGAY LẬP TỨC NẾU ADMIN ĐANG SỬA CHÍNH MÌNH
        if (editingId === currentUser?._id) {
          const newUserData = { ...currentUser, ...updatedUser };
          setUser(newUserData);
          localStorage.setItem("userInfo", JSON.stringify(newUserData));
        }
      } else {
        await userApi.create(dataToSubmit);
        toast.success("Tạo tài khoản mới thành công");
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  const handleDelete = async (id, role, name) => {
    if (id === currentUser?._id) {
      toast.error(
        "Bạn không thể tự xóa tài khoản của chính mình đang đăng nhập!",
      );
      return;
    }

    if (role === "admin") {
      if (
        !window.confirm(
          `CẢNH BÁO: Bạn đang chuẩn bị xóa một tài khoản Admin (${name}). Bạn có chắc chắn không?`,
        )
      )
        return;
    } else {
      if (!window.confirm(`Xóa tài khoản ${name}?`)) return;
    }

    try {
      await userApi.delete(id);
      toast.success("Đã xóa tài khoản");
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể xóa tài khoản này",
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Tài khoản & Phân quyền
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tài khoản Admin và tài khoản Đội cờ đỏ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Tìm tên hoặc tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 h-10 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
          >
            <UserPlus size={20} />
            <span>Tạo Tài Khoản</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="px-6 py-4 font-medium">STT</th>
              <th className="px-6 py-4 font-medium">Người dùng</th>
              <th className="px-6 py-4 font-medium">Tên đăng nhập</th>
              <th className="px-6 py-4 font-medium">Vai trò</th>
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
                    ? "Không tìm thấy tài khoản nào."
                    : "Chưa có dữ liệu."}
                </td>
              </tr>
            ) : (
              currentItems.map((u, index) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-600">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                        ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}
                      `}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800">
                        {u.name} {u._id === currentUser?._id && "(Bạn)"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-600">
                    {u.username}
                  </td>

                  <td className="px-6 py-4">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck size={14} /> Tổng phụ trách
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <UserIcon size={14} /> Đội Cờ đỏ
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(u)}
                      className="text-gray-400 hover:text-blue-600 mx-2 transition-colors cursor-pointer"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.role, u.name)}
                      disabled={u._id === currentUser?._id}
                      className={`mx-2 transition-colors ${u._id === currentUser?._id ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500 cursor-pointer"}`}
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
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
            </span>{" "}
            /{" "}
            <span className="font-medium text-gray-900">
              {filteredUsers.length}
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

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Cập nhật Tài khoản" : "Tạo Tài khoản Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="VD: Cờ đỏ Khối 6, Thầy Tuấn..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="VD: codo_khoi6"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu{" "}
                  {editingId && (
                    <span className="text-gray-400 font-normal italic">
                      (Bỏ trống nếu không đổi)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Nhập mật khẩu..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò (Phân quyền)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="user">Đội Cờ đỏ (Chỉ xem và chấm điểm)</option>
                  <option value="admin">
                    Tổng phụ trách (Toàn quyền hệ thống)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
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

export default Users;
