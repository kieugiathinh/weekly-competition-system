// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "sonner";
// import { Lock, User, Eye, EyeOff } from "lucide-react";
// import logo from "../assets/logothcstranphu.jpg";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!username || !password) {
//       toast.warning("Vui lòng nhập đủ tài khoản và mật khẩu");
//       return;
//     }

//     setLoading(true);
//     const result = await login(username, password);
//     setLoading(false);

//     if (result.success) {
//       toast.success(result.message);
//       navigate("/");
//     } else {
//       toast.error(result.message);
//     }
//   };

//   return (
//     <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row bg-white font-sans overflow-hidden">
//       {/* NỬA BÊN TRÁI: Form Đăng nhập */}
//       <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-6 sm:p-12 relative z-10 bg-white">
//         <div className="w-full max-w-md">
//           {/* Logo & Tên ứng dụng (Đồng bộ với Sidebar) */}
//           <div className="flex flex-col items-center mb-10">
//             <img
//               src={logo}
//               alt="Logo THCS Trần Phú"
//               className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 shadow-md mb-4"
//             />
//             <div className="text-center">
//               <span className="block text-[18px] font-extrabold text-blue-700 uppercase tracking-wide leading-snug">
//                 Ứng dụng quản lý
//               </span>
//               <span className="block text-sm font-semibold text-blue-500 uppercase mt-1">
//                 Thi đua tuần
//               </span>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//             {/* Input Tài khoản */}
//             <div>
//               <label className="block mb-2 text-sm font-bold text-gray-700">
//                 Tên đăng nhập
//               </label>
//               <div className="relative">
//                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//                   <User size={20} />
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Nhập tài khoản..."
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="w-full h-12 pl-12 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
//                 />
//               </div>
//             </div>

//             {/* Input Mật khẩu (Có tích hợp Eye Icon) */}
//             <div>
//               <label className="block mb-2 text-sm font-bold text-gray-700">
//                 Mật khẩu
//               </label>
//               <div className="relative">
//                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//                   <Lock size={20} />
//                 </span>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Nhập mật khẩu..."
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full h-12 pl-12 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             {/* Nút Đăng nhập */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full h-12 mt-4 text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Đang xử lý...
//                 </>
//               ) : (
//                 "Đăng nhập hệ thống"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* NỬA BÊN PHẢI: Banner Ảnh Trường Học (Chỉ hiện trên PC/Laptop) */}
//       <div className="relative hidden w-full h-full lg:w-1/2 lg:block">
//         {/* MẸO: Thay link "src" bên dưới bằng đường dẫn ảnh trường của bạn.
//           Ví dụ: src={require('../assets/anhtruong.jpg')} hoặc import ở trên.
//           Thuộc tính object-cover giúp ảnh luôn full khung hình mà không bị méo.
//         */}
//         <img
//           src="https://toplist.vn/images/800px/truong-thcs-tran-phu-1408876.jpg"
//           alt="Trường THCS Trần Phú"
//           className="absolute inset-0 w-full h-full object-cover"
//         />

//         {/* Lớp phủ màu xanh đen (Overlay) để chữ nổi bật trên nền ảnh */}
//         <div className="absolute inset-0 bg-blue-900/70 flex flex-col items-center justify-center p-12 text-center backdrop-blur-sm">
//           <div className="bg-white/10 p-8 rounded-2xl border border-white/20 backdrop-blur-md">
//             <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">
//               THCS Trần Phú
//             </h2>
//             <p className="text-blue-50 text-lg leading-relaxed">
//               Giải pháp chuyển đổi số công tác thống kê thi đua <br />
//               dành riêng cho Thầy/Cô Tổng phụ trách và Đội cờ đỏ.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Lock, User, Eye, EyeOff } from "lucide-react";

// Import Logo đồng bộ với Sidebar
import logo from "../assets/logothcstranphu.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State quản lý ẩn/hiện mật khẩu
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
    <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row bg-white font-sans overflow-hidden">
      {/* NỬA BÊN TRÁI: Form Đăng nhập (Giữ nguyên hoàn toàn) */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-6 sm:p-12 relative z-10 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Tên ứng dụng */}
          <div className="flex flex-col items-center mb-10">
            <img
              src={logo}
              alt="Logo THCS Trần Phú"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-100 shadow-md mb-4"
            />
            <div className="text-center">
              <span className="block text-[18px] font-extrabold text-blue-700 uppercase tracking-wide leading-snug">
                Ứng dụng quản lý
              </span>
              <span className="block text-sm font-semibold text-blue-500 uppercase mt-1">
                Thi đua tuần
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Input Tài khoản */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
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
                  className="w-full h-12 pl-12 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
            </div>

            {/* Input Mật khẩu (Có tích hợp Eye Icon) */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                {/* Nút Ẩn/Hiện mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* NỬA BÊN PHẢI: Banner Ảnh & Giới thiệu hệ thống */}
      <div className="relative hidden w-full h-full lg:w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
          alt="Trường THCS Trần Phú"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Lớp phủ màu xanh đen và Khung giới thiệu */}
        <div className="absolute inset-0 bg-blue-900/80 flex flex-col items-center justify-center p-12 backdrop-blur-sm">
          <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md max-w-lg w-full shadow-2xl">
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-md border-b border-white/20 pb-4">
              Giới thiệu hệ thống
            </h2>

            <div className="text-blue-50 text-[15px] leading-relaxed space-y-4">
              <p>
                <strong>Phần mềm Quản lý Thi đua</strong> là giải pháp chuyển
                đổi số dành riêng cho trường THCS, được thiết kế để tối ưu hóa
                công tác thống kê nề nếp nội bộ.
              </p>

              <ul className="list-disc list-inside space-y-2.5 text-blue-100 ml-1">
                <li>Tự động hóa quy trình chấm điểm Tuần & Tháng.</li>
                <li>Tự động cộng điểm, xếp hạng và tổng hợp lỗi vi phạm.</li>
                <li>Cơ chế khóa sổ thông minh, bảo vệ an toàn dữ liệu.</li>
                <li>Xuất báo cáo thống kê Excel nhanh chóng, chính xác.</li>
              </ul>

              <p className="pt-4 text-sm italic text-blue-200 text-center font-medium">
                Đồng hành cùng Thầy/Cô Tổng phụ trách và Đội cờ đỏ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
