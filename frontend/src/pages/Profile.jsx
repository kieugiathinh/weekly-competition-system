// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { Edit, X, Camera, ShieldCheck, User as UserIcon } from "lucide-react";
// import { toast } from "sonner";
// // import { userApi } from "../api/userApi";

// const Profile = () => {
//   const { user: currentUser } = useAuth();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // State cho Form Edit
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     phone: "",
//     bio: "",
//   });

//   // Load dữ liệu thật vào form khi mở Modal
//   const openModal = () => {
//     setFormData({
//       name: currentUser?.name || "",
//       username: currentUser?.username || "",
//       phone: currentUser?.phone || "+84 123 456 789",
//       bio:
//         currentUser?.role === "admin"
//           ? "Quản lý toàn bộ hệ thống thi đua của trường."
//           : "Phụ trách theo dõi và chấm điểm nề nếp.",
//     });
//     setIsModalOpen(true);
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       // Giả lập lưu thành công
//       setTimeout(() => {
//         toast.success("Đã cập nhật thông tin thành công!");
//         setIsModalOpen(false);
//         setLoading(false);
//       }, 500);
//     } catch (error) {
//       toast.error("Lỗi khi cập nhật thông tin");
//       setLoading(false);
//     }
//   };

//   const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

//   return (
//     // Đã xóa class "max-w-5xl mx-auto" ở đây để trang căng tràn 100% giống Users.jsx
//     <div className="font-sans space-y-6 w-full">
//       {/* HEADER PAGE */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h2 className="text-xl font-bold text-gray-800">Hồ sơ cá nhân</h2>
//         <p className="text-sm text-gray-500 mt-1">
//           Quản lý thông tin tài khoản và cài đặt bảo mật.
//         </p>
//       </div>

//       {/* 1. CARD BÊN TRÊN: USER META (Ảnh đại diện & Tên) */}
//       <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm lg:p-6">
//         <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
//           <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
//             {/* Vùng Avatar */}
//             <div className="relative shrink-0">
//               <div
//                 className={`w-20 h-20 overflow-hidden border-4 border-white shadow-md rounded-full flex items-center justify-center text-3xl font-bold text-white
//                 ${currentUser?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}
//               `}
//               >
//                 {getInitials(currentUser?.name)}
//               </div>
//               <button className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
//                 <Camera size={14} />
//               </button>
//             </div>

//             {/* Thông tin chính */}
//             <div className="order-3 xl:order-2 flex-1 text-center xl:text-left">
//               <h4 className="mb-2 text-xl font-bold text-gray-800">
//                 {currentUser?.name || "Người dùng"}
//               </h4>
//               <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-3">
//                 {currentUser?.role === "admin" ? (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
//                     <ShieldCheck size={14} /> Tổng phụ trách
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
//                     <UserIcon size={14} /> Đội cờ đỏ
//                   </span>
//                 )}
//                 <div className="hidden h-4 w-px bg-gray-300 xl:block"></div>
//                 <p className="text-sm font-medium text-gray-500">
//                   Trường THCS / THPT
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={openModal}
//             className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors xl:w-auto shrink-0"
//           >
//             <Edit size={16} />
//             Chỉnh sửa
//           </button>
//         </div>
//       </div>

//       {/* 2. CARD BÊN DƯỚI: THÔNG TIN CHI TIẾT (User Info) */}
//       <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm lg:p-6">
//         <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
//           <div className="w-full">
//             <h4 className="text-lg font-bold text-gray-800 lg:mb-6 mb-4 border-b border-gray-100 pb-3">
//               Thông tin chi tiết
//             </h4>

//             <div className="grid grid-cols-1 gap-y-6 gap-x-8 lg:grid-cols-2">
//               <div>
//                 <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
//                   Tên hiển thị
//                 </p>
//                 <p className="text-base font-semibold text-gray-800">
//                   {currentUser?.name || "Chưa cập nhật"}
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
//                   Tên đăng nhập (Username)
//                 </p>
//                 <p className="text-base font-semibold text-gray-800">
//                   {currentUser?.username || "Chưa cập nhật"}
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
//                   Phân quyền hệ thống
//                 </p>
//                 <p className="text-base font-semibold text-gray-800 capitalize">
//                   {currentUser?.role === "admin"
//                     ? "Quản trị viên (Admin)"
//                     : "Thành viên (User)"}
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
//                   Số điện thoại
//                 </p>
//                 <p className="text-base font-semibold text-gray-800">
//                   +84 123 456 789
//                 </p>
//               </div>

//               <div className="lg:col-span-2">
//                 <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
//                   Tiểu sử / Ghi chú
//                 </p>
//                 <p className="text-base font-medium text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-1">
//                   {currentUser?.role === "admin"
//                     ? "Là người quản trị toàn bộ hệ thống. Có quyền tạo năm học, tạo tuần, thêm tiêu chí và quản lý tài khoản đội cờ đỏ."
//                     : "Được phân công trực tuần và chấm điểm thi đua các lớp theo tiêu chí nhà trường đề ra."}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 3. MODAL EDIT PROFILE */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
//           <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
//               <div>
//                 <h4 className="text-xl font-bold text-gray-800">
//                   Cập nhật hồ sơ
//                 </h4>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Sửa đổi thông tin cá nhân của bạn.
//                 </p>
//               </div>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Modal Body (Form) */}
//             <form onSubmit={handleSave} className="flex flex-col">
//               <div className="px-6 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
//                 <h5 className="mb-4 text-lg font-bold text-gray-800">
//                   Thông tin cơ bản
//                 </h5>
//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
//                   <div className="md:col-span-2">
//                     <label className="block mb-1.5 text-sm font-medium text-gray-700">
//                       Tên hiển thị
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, name: e.target.value })
//                       }
//                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-1.5 text-sm font-medium text-gray-700">
//                       Tên đăng nhập (Username)
//                     </label>
//                     <input
//                       type="text"
//                       disabled
//                       value={formData.username}
//                       className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
//                     />
//                     <p className="text-xs text-gray-400 mt-1">
//                       Không thể đổi tên đăng nhập.
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block mb-1.5 text-sm font-medium text-gray-700">
//                       Số điện thoại
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.phone}
//                       onChange={(e) =>
//                         setFormData({ ...formData, phone: e.target.value })
//                       }
//                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block mb-1.5 text-sm font-medium text-gray-700">
//                       Tiểu sử
//                     </label>
//                     <textarea
//                       rows="3"
//                       value={formData.bio}
//                       onChange={(e) =>
//                         setFormData({ ...formData, bio: e.target.value })
//                       }
//                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors resize-none"
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//                 >
//                   Hủy bỏ
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
//                 >
//                   {loading ? "Đang lưu..." : "Lưu thay đổi"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Edit, X, Camera, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "../api/userApi";

const Profile = () => {
  // 1. LẤY THÊM setUser TỪ AuthContext
  const { user: currentUser, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const openModal = () => {
    setFormData({
      name: currentUser?.name || "",
      username: currentUser?.username || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        username: formData.username,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // 2. GỌI API THỰC TẾ
      const updatedUser = await userApi.update(currentUser._id, updateData);

      // 3. ĐỒNG BỘ DỮ LIỆU FRONTEND NGAY LẬP TỨC
      // Gộp data cũ (để giữ token/role nếu API không trả về) với data mới
      const newUserData = { ...currentUser, ...updatedUser };
      setUser(newUserData);
      localStorage.setItem("userInfo", JSON.stringify(newUserData));

      toast.success("Đã cập nhật thông tin thành công!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật thông tin",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <div className="font-sans space-y-6 w-full">
      {/* HEADER PAGE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ cá nhân</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin tài khoản và cài đặt bảo mật.
        </p>
      </div>

      {/* 1. CARD BÊN TRÊN: USER META (Ảnh đại diện & Tên) */}
      <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Vùng Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 overflow-hidden border-4 border-white shadow-md rounded-full flex items-center justify-center text-3xl font-bold text-white
                ${currentUser?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}
              `}
              >
                {getInitials(currentUser?.name)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                <Camera size={14} />
              </button>
            </div>

            {/* Thông tin chính */}
            <div className="order-3 xl:order-2 flex-1 text-center xl:text-left">
              <h4 className="mb-2 text-xl font-bold text-gray-800">
                {currentUser?.name || "Người dùng"}
              </h4>
              <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-3">
                {currentUser?.role === "admin" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck size={14} /> Tổng phụ trách
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    <UserIcon size={14} /> Đội cờ đỏ
                  </span>
                )}
                <div className="hidden h-4 w-px bg-gray-300 xl:block"></div>
                <p className="text-sm font-medium text-gray-500">
                  Hệ thống Quản lý Thi đua
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors xl:w-auto shrink-0"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* 2. CARD BÊN DƯỚI: THÔNG TIN CHI TIẾT */}
      <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-bold text-gray-800 lg:mb-6 mb-4 border-b border-gray-100 pb-3">
              Thông tin chi tiết
            </h4>

            <div className="grid grid-cols-1 gap-y-6 gap-x-8 md:grid-cols-3">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Tên hiển thị
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {currentUser?.name || "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Tên đăng nhập (Username)
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {currentUser?.username || "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Phân quyền hệ thống
                </p>
                <p className="text-base font-semibold text-gray-800 capitalize">
                  {currentUser?.role === "admin"
                    ? "Quản trị viên (Admin)"
                    : "Thành viên (User)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL EDIT PROFILE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h4 className="text-xl font-bold text-gray-800">
                  Cập nhật hồ sơ
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Sửa đổi thông tin cá nhân của bạn.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col">
              <div className="px-6 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={currentUser?.role !== "admin"}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors
                        ${
                          currentUser?.role === "admin"
                            ? "bg-white border-gray-200 text-gray-800"
                            : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                        }
                      `}
                    />
                    {currentUser?.role !== "admin" && (
                      <p className="text-xs text-gray-400 mt-1">
                        Chỉ Quản trị viên mới có quyền đổi tên đăng nhập.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-2 pt-5">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">
                      Đổi mật khẩu mới{" "}
                      <span className="text-gray-400 font-normal italic">
                        (Không bắt buộc)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
