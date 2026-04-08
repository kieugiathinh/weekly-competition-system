import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("Vui lòng nhập đủ tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      navigate("/"); // Đăng nhập thành công -> chuyển về trang chủ
    } else {
      toast.error(result.message); // Hiển thị lỗi từ Backend (VD: Sai mật khẩu)
    }
  };

  return (
    <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row bg-white font-sans">
      {/* Nửa bên trái: Form Đăng nhập */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
            <p className="text-gray-500">
              Hệ thống quản lý điểm thi đua nội bộ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Nhập tài khoản..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-sm bg-transparent border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-sm bg-transparent border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>

      {/* Nửa bên phải: Banner (Chỉ hiện trên màn hình lớn) */}
      <div className="items-center justify-center hidden w-full h-full lg:w-1/2 bg-blue-600 lg:flex">
        <div className="text-center px-10">
          <h2 className="text-4xl font-bold text-white mb-4">ThiĐuaTHCS</h2>
          <p className="text-blue-100 text-lg">
            Giải pháp chuyển đổi số công tác thống kê thi đua <br /> dành riêng
            cho Thầy/Cô Tổng phụ trách.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
