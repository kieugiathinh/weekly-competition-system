// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import { useAuth } from "../context/AuthContext";
// import { io } from "socket.io-client";
// import { notificationApi } from "../api/notificationApi";
// import { toast } from "sonner";
// import {
//   Menu,
//   Search,
//   ChevronDown,
//   User,
//   LogOut,
//   Bell,
//   CheckCheck,
//   Clock,
//   Trash2,
//   X,
// } from "lucide-react";

// const AppHeader = () => {
//   const { toggleSidebar, toggleMobileSidebar } = useSidebar();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const inputRef = useRef(null);
//   const userDropdownRef = useRef(null);
//   const notifDropdownRef = useRef(null);

//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     if (user?.role === "admin") {
//       const loadInitialNotifications = async () => {
//         try {
//           const data = await notificationApi.getAll();
//           setNotifications(data);
//           setUnreadCount(data.filter((n) => !n.isRead).length);
//         } catch (error) {
//           console.error("Lỗi tải thông báo:", error);
//         }
//       };
//       loadInitialNotifications();

//       const socket = io("http://localhost:5000"); // Chỉnh lại port 3000 nếu bạn đã đổi backend sang 3000
//       socket.emit("join_admin_room");
//       socket.on("new_notification", (newNotif) => {
//         setNotifications((prev) => [newNotif, ...prev]);
//         setUnreadCount((prev) => prev + 1);
//         toast.info(newNotif.title, { description: newNotif.message });
//       });
//       return () => socket.disconnect();
//     }
//   }, [user]);

//   // Đóng dropdown khi click ngoài
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         userDropdownRef.current &&
//         !userDropdownRef.current.contains(e.target)
//       )
//         setIsUserDropdownOpen(false);
//       if (
//         notifDropdownRef.current &&
//         !notifDropdownRef.current.contains(e.target)
//       )
//         setIsNotifDropdownOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleMarkAsRead = async (id, isRead) => {
//     if (isRead) return;
//     try {
//       await notificationApi.markAsRead(id);
//       setNotifications((prev) =>
//         prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await notificationApi.markAllAsRead();
//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//     } catch (error) {
//       toast.error("Lỗi cập nhật");
//     }
//   };

//   const handleDeleteNotif = async (e, id, isRead) => {
//     e.stopPropagation(); // Ngăn việc bấm vào xóa lại kích hoạt hàm markAsRead
//     try {
//       await notificationApi.delete(id);
//       setNotifications((prev) => prev.filter((n) => n._id !== id));
//       if (!isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
//       toast.success("Đã xóa thông báo");
//     } catch (error) {
//       toast.error("Lỗi khi xóa");
//     }
//   };

//   const handleDeleteAll = async () => {
//     if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo?")) return;
//     try {
//       await notificationApi.deleteAll();
//       setNotifications([]);
//       setUnreadCount(0);
//       setIsNotifDropdownOpen(false);
//       toast.success("Đã dọn dẹp sạch thông báo");
//     } catch (error) {
//       toast.error("Lỗi khi xóa tất cả");
//     }
//   };

//   return (
//     <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
//       <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
//         <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
//           <button
//             className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border transition-colors cursor-pointer"
//             onClick={() =>
//               window.innerWidth >= 1024
//                 ? toggleSidebar()
//                 : toggleMobileSidebar()
//             }
//           >
//             <Menu size={20} />
//           </button>
//           <div className="hidden lg:block ml-4">
//             <div className="relative">
//               <span className="absolute -translate-y-1/2 left-4 top-1/2 text-gray-400">
//                 <Search size={18} />
//               </span>
//               <input
//                 ref={inputRef}
//                 type="text"
//                 placeholder="Tìm kiếm nhanh... (Ctrl+K)"
//                 className="w-full xl:w-[400px] h-10 pl-11 pr-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 lg:gap-4 px-5 py-4 lg:px-0">
//           {user?.role === "admin" && (
//             <div className="relative" ref={notifDropdownRef}>
//               <button
//                 onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
//                 className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
//               >
//                 <Bell size={22} />
//                 {unreadCount > 0 && (
//                   <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
//                     {unreadCount > 9 ? "9+" : unreadCount}
//                   </span>
//                 )}
//               </button>

//               {isNotifDropdownOpen && (
//                 <div className="absolute right-0 top-[110%] w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
//                   <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
//                     <h3 className="font-bold text-gray-800 text-sm">
//                       Thông báo
//                     </h3>
//                     <div className="flex gap-3">
//                       {notifications.length > 0 && (
//                         <>
//                           <button
//                             onClick={handleMarkAllAsRead}
//                             className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
//                             title="Đọc tất cả"
//                           >
//                             <CheckCheck size={14} /> Đọc hết
//                           </button>
//                           <button
//                             onClick={handleDeleteAll}
//                             className="text-[11px] font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
//                             title="Xóa tất cả"
//                           >
//                             <Trash2 size={13} /> Xóa sạch
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="max-h-[400px] overflow-y-auto no-scrollbar">
//                     {notifications.length === 0 ? (
//                       <div className="p-8 text-center text-gray-400 text-sm">
//                         Chưa có thông báo nào
//                       </div>
//                     ) : (
//                       notifications.map((notif) => (
//                         <div
//                           key={notif._id}
//                           onClick={() =>
//                             handleMarkAsRead(notif._id, notif.isRead)
//                           }
//                           className={`group relative p-4 border-b border-gray-50 last:border-0 transition-colors ${notif.isRead ? "bg-white" : "bg-blue-50/40 hover:bg-blue-50/60"}`}
//                         >
//                           <div className="flex justify-between items-start mb-1 pr-6">
//                             <span
//                               className={`text-[13px] ${notif.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
//                             >
//                               {notif.title}
//                             </span>
//                             {!notif.isRead && (
//                               <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
//                             )}
//                           </div>
//                           <p className="text-xs text-gray-500 leading-relaxed mb-2">
//                             {notif.message}
//                           </p>
//                           <div className="flex items-center gap-1 text-[10px] text-gray-400">
//                             <Clock size={10} />{" "}
//                             {new Date(notif.createdAt).toLocaleString("vi-VN")}
//                           </div>

//                           {/* Nút xóa từng cái (Hiện khi hover) */}
//                           <button
//                             onClick={(e) =>
//                               handleDeleteNotif(e, notif._id, notif.isRead)
//                             }
//                             className="absolute top-4 right-3 p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ... Phần Avatar bên dưới giữ nguyên ... */}
//           <div className="relative" ref={userDropdownRef}>
//             <button
//               onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//               className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
//             >
//               <div
//                 className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}`}
//               >
//                 {user?.name?.charAt(0).toUpperCase() || "U"}
//               </div>
//               <div className="hidden md:block text-left">
//                 <span className="block text-sm font-semibold text-gray-900 leading-tight">
//                   {user?.name}
//                 </span>
//                 <span className="block text-xs text-gray-500">
//                   {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
//                 </span>
//               </div>
//               <ChevronDown
//                 size={16}
//                 className={`text-gray-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
//               />
//             </button>
//             {isUserDropdownOpen && (
//               <div className="absolute right-0 top-[110%] w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
//                 <Link
//                   to="/profile"
//                   className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <User size={16} /> Hồ sơ
//                 </Link>
//                 <div className="h-px bg-gray-100 my-1"></div>
//                 <button
//                   onClick={() => {
//                     logout();
//                     navigate("/login");
//                   }}
//                   className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
//                 >
//                   <LogOut size={16} /> Đăng xuất
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AppHeader;

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext"; // Thêm AuthContext
import { io } from "socket.io-client"; // Thêm socket
import { notificationApi } from "../api/notificationApi"; // Thêm api thông báo
import { toast } from "sonner"; // Thêm toast
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  X,
} from "lucide-react";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth(); // Lấy thông tin user đang đăng nhập
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const dropdownRef = useRef(null); // Ref của avatar dropdown
  const notifDropdownRef = useRef(null); // Ref của notification dropdown

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // --- STATES QUẢN LÝ THÔNG BÁO ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // Phím tắt Cmd+K / Ctrl+K để focus vào ô tìm kiếm
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Xử lý đóng Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC KẾT NỐI SOCKET & LẤY THÔNG BÁO (Chỉ chạy khi là Admin) ---
  useEffect(() => {
    if (user?.role === "admin") {
      const loadInitialNotifications = async () => {
        try {
          const data = await notificationApi.getAll();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        } catch (error) {
          console.error("Lỗi tải thông báo:", error);
        }
      };
      loadInitialNotifications();

      const socket = io("http://localhost:5000"); // Chỉnh thành domain thực tế khi Deploy

      socket.emit("join_admin_room");

      socket.on("new_notification", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(newNotif.title, { description: newNotif.message });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  // --- CÁC HÀM XỬ LÝ THÔNG BÁO ---
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDeleteNotif = async (e, id, isRead) => {
    e.stopPropagation();
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (!isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Đã xóa thông báo");
    } catch (error) {
      toast.error("Lỗi khi xóa");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo?")) return;
    try {
      await notificationApi.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
      setIsNotifDropdownOpen(false);
      toast.success("Đã dọn dẹp sạch thông báo");
    } catch (error) {
      toast.error("Lỗi khi xóa tất cả");
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };

  // Lấy chữ cái đầu của tên để làm Avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
          {/* NÚT MỞ RỘNG/THU GỌN SIDEBAR */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border lg:border-gray-200 transition-colors cursor-pointer"
            onClick={handleToggle}
          >
            <Menu size={20} />
          </button>

          {/* Ô TÌM KIẾM */}
          <div className="hidden lg:block ml-4">
            <div className="relative">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm nhanh... (Ctrl+K)"
                className="w-full xl:w-[400px] h-10 pl-11 pr-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* KHU VỰC BÊN PHẢI (CHUÔNG THÔNG BÁO VÀ AVATAR) */}
        <div className="flex items-center gap-2 lg:gap-4 px-5 py-4 lg:px-0">
          {/* --- KHU VỰC CHUÔNG THÔNG BÁO --- */}
          {user?.role === "admin" && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsDropdownOpen(false); // Đóng avatar dropdown nếu đang mở
                }}
                className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN DANH SÁCH THÔNG BÁO */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 top-[100%] mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">
                      Thông báo
                    </h3>
                    <div className="flex gap-3">
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck size={14} /> Đọc hết
                          </button>
                          <button
                            onClick={handleDeleteAll}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} /> Xóa sạch
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        Chưa có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() =>
                            handleMarkAsRead(notif._id, notif.isRead)
                          }
                          className={`group relative p-4 border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${notif.isRead ? "bg-white" : "bg-blue-50/40 hover:bg-blue-50/60"}`}
                        >
                          <div className="flex justify-between items-start mb-1 pr-6">
                            <span
                              className={`text-[13px] ${notif.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
                            >
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock size={10} />{" "}
                            {new Date(notif.createdAt).toLocaleString("vi-VN")}
                          </div>

                          <button
                            onClick={(e) =>
                              handleDeleteNotif(e, notif._id, notif.isRead)
                            }
                            className="absolute top-4 right-3 p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- KHU VỰC AVATAR & DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotifDropdownOpen(false); // Đóng thông báo nếu đang mở
              }}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white
                ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}
              `}
              >
                {getInitials(user?.name)}
              </div>

              <div className="hidden md:block text-left">
                <span className="block text-sm font-semibold text-gray-900 leading-tight">
                  {user?.name || "Người dùng"}
                </span>
                <span className="block text-xs text-gray-500">
                  {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
                </span>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* MENU DROPDOWN */}
            {isDropdownOpen && (
              <div className="absolute right-4 lg:right-0 top-[100%] mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <span className="block text-sm font-semibold text-gray-900">
                    {user?.name || "Người dùng"}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </Link>
                  {/* <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings size={16} />
                    Cài đặt
                  </Link> */}
                </div>

                <div className="py-1 border-t border-gray-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
