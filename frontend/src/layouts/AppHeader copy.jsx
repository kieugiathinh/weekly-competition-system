// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import { useAuth } from "../context/AuthContext";
// import { io } from "socket.io-client"; // BỔ SUNG SOCKET.IO
// import { notificationApi } from "../api/notificationApi"; // BỔ SUNG API
// import { toast } from "sonner";
// import {
//   Menu,
//   Search,
//   ChevronDown,
//   User,
//   LogOut,
//   Bell, // BỔ SUNG ICON
//   CheckCheck, // BỔ SUNG ICON
// } from "lucide-react";

// const AppHeader = () => {
//   const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const inputRef = useRef(null);
//   const userDropdownRef = useRef(null);
//   const notifDropdownRef = useRef(null);

//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

//   // --- STATE QUẢN LÝ THÔNG BÁO ---
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   const handleToggle = () => {
//     if (window.innerWidth >= 1024) toggleSidebar();
//     else toggleMobileSidebar();
//   };

//   // Phím tắt Cmd+K / Ctrl+K
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if ((event.metaKey || event.ctrlKey) && event.key === "k") {
//         event.preventDefault();
//         inputRef.current?.focus();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // Xử lý đóng Dropdown khi click ra ngoài
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         userDropdownRef.current &&
//         !userDropdownRef.current.contains(event.target)
//       ) {
//         setIsUserDropdownOpen(false);
//       }
//       if (
//         notifDropdownRef.current &&
//         !notifDropdownRef.current.contains(event.target)
//       ) {
//         setIsNotifDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // --- LOGIC SOCKET.IO & THÔNG BÁO ---
//   useEffect(() => {
//     // Chỉ kích hoạt Socket và gọi API nếu là Admin
//     if (user?.role === "admin") {
//       // 1. Gọi API lấy thông báo cũ
//       const fetchNotifications = async () => {
//         try {
//           const data = await notificationApi.getAll();
//           setNotifications(data);
//           setUnreadCount(data.filter((n) => !n.isRead).length);
//         } catch (error) {
//           console.error("Lỗi tải thông báo", error);
//         }
//       };
//       fetchNotifications();

//       // 2. Kết nối Socket.IO
//       // LƯU Ý: Thay URL này bằng link backend thật của bạn nếu deploy (VD: https://api.yourdomain.com)
//       const socketUrl = import.meta.env.VITE_API_URL
//         ? import.meta.env.VITE_API_URL.replace("/api", "")
//         : "http://localhost:5000";

//       const socket = io(socketUrl);

//       // Xin gia nhập phòng Admin
//       socket.emit("join_admin_room");

//       // Lắng nghe sự kiện có thông báo mới
//       socket.on("new_notification", (newNotif) => {
//         setNotifications((prev) => [newNotif, ...prev]);
//         setUnreadCount((prev) => prev + 1);

//         // Hiển thị Pop-up ở góc màn hình
//         toast.info(newNotif.title, {
//           description: newNotif.message,
//           duration: 5000,
//         });
//       });

//       // Cleanup khi component unmount hoặc user đăng xuất
//       return () => socket.disconnect();
//     }
//   }, [user]);

//   // Hàm đánh dấu 1 thông báo đã đọc
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

//   // Hàm đánh dấu đọc tất cả
//   const handleMarkAllAsRead = async () => {
//     if (unreadCount === 0) return;
//     try {
//       await notificationApi.markAllAsRead();
//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//       setIsNotifDropdownOpen(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Xử lý đăng xuất
//   const handleLogout = () => {
//     if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
//       logout();
//       navigate("/login");
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return "U";
//     return name.charAt(0).toUpperCase();
//   };

//   return (
//     <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
//       <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
//         <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
//           <button
//             className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border lg:border-gray-200 transition-colors cursor-pointer"
//             onClick={handleToggle}
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
//                 className="w-full xl:w-[400px] h-10 pl-11 pr-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
//               />
//             </div>
//           </div>
//         </div>

//         {/* KHU VỰC BÊN PHẢI: CHUÔNG THÔNG BÁO & AVATAR */}
//         <div className="flex items-center gap-2 lg:gap-4 px-5 py-4 lg:px-0">
//           {/* QUẢ CHUÔNG THÔNG BÁO (Chỉ hiện cho Admin) */}
//           {user?.role === "admin" && (
//             <div className="relative" ref={notifDropdownRef}>
//               <button
//                 onClick={() => {
//                   setIsNotifDropdownOpen(!isNotifDropdownOpen);
//                   setIsUserDropdownOpen(false);
//                 }}
//                 className="relative flex items-center justify-center w-10 h-10 text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
//               >
//                 <Bell size={22} />
//                 {unreadCount > 0 && (
//                   <span className="absolute top-1 right-1 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
//                     {unreadCount > 99 ? "99+" : unreadCount}
//                   </span>
//                 )}
//               </button>

//               {/* DROPDOWN THÔNG BÁO */}
//               {isNotifDropdownOpen && (
//                 <div className="absolute right-0 top-[100%] mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
//                   <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
//                     <h3 className="font-bold text-gray-800">Thông báo</h3>
//                     {unreadCount > 0 && (
//                       <button
//                         onClick={handleMarkAllAsRead}
//                         className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
//                       >
//                         <CheckCheck size={14} />
//                         Đánh dấu đã đọc
//                       </button>
//                     )}
//                   </div>

//                   <div className="max-h-[360px] overflow-y-auto no-scrollbar">
//                     {notifications.length === 0 ? (
//                       <div className="p-6 text-center text-sm text-gray-500">
//                         Chưa có thông báo nào.
//                       </div>
//                     ) : (
//                       <ul className="divide-y divide-gray-50">
//                         {notifications.map((notif) => (
//                           <li
//                             key={notif._id}
//                             onClick={() =>
//                               handleMarkAsRead(notif._id, notif.isRead)
//                             }
//                             className={`p-4 cursor-pointer transition-colors ${
//                               notif.isRead
//                                 ? "bg-white hover:bg-gray-50"
//                                 : "bg-blue-50/40 hover:bg-blue-50"
//                             }`}
//                           >
//                             <div className="flex justify-between items-start gap-2">
//                               <h4
//                                 className={`text-sm ${notif.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-bold"}`}
//                               >
//                                 {notif.title}
//                               </h4>
//                               {!notif.isRead && (
//                                 <span className="w-2 h-2 mt-1 rounded-full bg-blue-600 shrink-0"></span>
//                               )}
//                             </div>
//                             <p
//                               className={`text-xs mt-1 leading-relaxed ${notif.isRead ? "text-gray-500" : "text-gray-600"}`}
//                             >
//                               {notif.message}
//                             </p>
//                             <span className="block text-[10px] text-gray-400 mt-2 font-medium">
//                               {new Date(notif.createdAt).toLocaleString(
//                                 "vi-VN",
//                               )}
//                             </span>
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* KHU VỰC AVATAR */}
//           <div className="relative" ref={userDropdownRef}>
//             <button
//               onClick={() => {
//                 setIsUserDropdownOpen(!isUserDropdownOpen);
//                 setIsNotifDropdownOpen(false);
//               }}
//               className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
//             >
//               <div
//                 className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white
//                 ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}
//               `}
//               >
//                 {getInitials(user?.name)}
//               </div>

//               <div className="hidden md:block text-left">
//                 <span className="block text-sm font-semibold text-gray-900 leading-tight">
//                   {user?.name || "Người dùng"}
//                 </span>
//                 <span className="block text-xs text-gray-500">
//                   {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
//                 </span>
//               </div>

//               <ChevronDown
//                 size={16}
//                 className={`text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {/* DROPDOWN USER */}
//             {isUserDropdownOpen && (
//               <div className="absolute right-4 lg:right-0 top-[100%] mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
//                 <div className="px-4 py-3 border-b border-gray-100 md:hidden">
//                   <span className="block text-sm font-semibold text-gray-900">
//                     {user?.name || "Người dùng"}
//                   </span>
//                   <span className="block text-xs text-gray-500 mt-0.5">
//                     {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
//                   </span>
//                 </div>

//                 <div className="py-1">
//                   <Link
//                     to="/profile"
//                     onClick={() => setIsUserDropdownOpen(false)}
//                     className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
//                   >
//                     <User size={16} />
//                     Hồ sơ cá nhân
//                   </Link>
//                 </div>

//                 <div className="py-1 border-t border-gray-100 mt-1">
//                   <button
//                     onClick={handleLogout}
//                     className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
//                   >
//                     <LogOut size={16} />
//                     Đăng xuất
//                   </button>
//                 </div>
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
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client"; // Thư viện kết nối Realtime
import { notificationApi } from "../api/notificationApi"; // API thông báo bạn vừa tạo
import { toast } from "sonner"; // Thư viện hiển thị thông báo Pop-up
import {
  Menu,
  Search,
  ChevronDown,
  User,
  LogOut,
  Bell,
  CheckCheck,
  Clock,
} from "lucide-react";

const AppHeader = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // --- QUẢN LÝ THÔNG BÁO ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Kết nối Socket.IO và lấy dữ liệu ban đầu
  useEffect(() => {
    if (user?.role === "admin") {
      // Lấy danh sách 50 thông báo cũ từ Database
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

      // Mở kết nối Realtime tới Backend
      const socket = io("http://localhost:5000"); // Thay bằng URL Backend của bạn

      socket.emit("join_admin_room"); // Gia nhập phòng dành riêng cho Admin

      // Lắng nghe sự kiện "Có thông báo mới" từ Backend
      socket.on("new_notification", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Bật Pop-up thông báo tức thì (Ting ting!)
        toast.info(newNotif.title, {
          description: newNotif.message,
          icon: <Bell size={16} className="text-blue-600" />,
        });
      });

      return () => socket.disconnect(); // Ngắt kết nối khi đăng xuất
    }
  }, [user]);

  // Xử lý đóng Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái thông báo");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border lg:border-gray-200 transition-colors cursor-pointer"
            onClick={() =>
              window.innerWidth >= 1024
                ? toggleSidebar()
                : toggleMobileSidebar()
            }
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block ml-4">
            <div className="relative">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm nhanh... (Ctrl+K)"
                className="w-full xl:w-[400px] h-10 pl-11 pr-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 px-5 py-4 lg:px-0">
          {/* QUẢ CHUÔNG THÔNG BÁO (Chỉ hiện cho Admin) */}
          {user?.role === "admin" && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
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
                <div className="absolute right-0 top-[110%] w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">
                      Thông báo mới nhất
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={14} /> Đọc tất cả
                      </button>
                    )}
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
                          className={`p-4 border-b border-gray-50 last:border-0 transition-colors ${notif.isRead ? "bg-white" : "bg-blue-50/40 hover:bg-blue-50/60"}`}
                        >
                          <div className="flex justify-between items-start mb-1">
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
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AVATAR NGƯỜI DÙNG */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}`}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-sm font-semibold text-gray-900 leading-tight">
                  {user?.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 top-[110%] w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} /> Hồ sơ
                </Link>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
