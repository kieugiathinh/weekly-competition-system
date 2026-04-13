import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { notificationApi } from "../api/notificationApi";
import { toast } from "sonner";
import {
  Menu,
  Search,
  ChevronDown,
  User,
  LogOut,
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  X,
} from "lucide-react";

const AppHeader = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- LOGIC KẾT NỐI SOCKET DÙNG VITE_API_URL DYNAMIC ---
  useEffect(() => {
    if (user?.role === "admin") {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const socketUrl = apiUrl.replace("/api", "");

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

      // 2. Khởi tạo Socket với URL dynamic
      const socket = io(socketUrl, {
        withCredentials: true, // Đảm bảo đồng bộ cookie nếu có dùng
        transports: ["websocket", "polling"], // Tăng độ ổn định khi lên host
      });

      socket.emit("join_admin_room");

      socket.on("new_notification", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(newNotif.title, { description: newNotif.message });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  // Các hàm handleMarkAsRead, handleDelete... (giữ nguyên như bản trước tôi đã gửi)
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
      toast.error("Lỗi cập nhật");
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

  // Logic đóng dropdown, logout, initials... giữ nguyên thiết kế cũ của bạn
  const handleLogout = () => {
    if (window.confirm("Đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
      {/* Giao diện Header: Giữ nguyên 100% mã HTML/Tailwind cũ của Thịnh 
          Chỉ cần đảm bảo phần Bell icon và Dropdown Notification nằm cạnh Avatar.
      */}
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border cursor-pointer"
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
                className="w-full xl:w-[400px] h-10 pl-11 pr-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 px-5 py-4 lg:px-0">
          {/* PHẦN CHUÔNG THÔNG BÁO */}
          {user?.role === "admin" && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsDropdownOpen(false);
                }}
                className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b">
                    <h3 className="font-bold text-gray-800 text-sm">
                      Thông báo
                    </h3>
                    <div className="flex gap-3">
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
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        Trống
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() =>
                            handleMarkAsRead(notif._id, notif.isRead)
                          }
                          className={`group relative p-4 border-b border-gray-50 transition-colors cursor-pointer ${notif.isRead ? "bg-white" : "bg-blue-50/40 hover:bg-blue-50/60"}`}
                        >
                          <div className="flex justify-between items-start pr-6">
                            <span
                              className={`text-[13px] ${notif.isRead ? "font-medium" : "font-bold text-gray-900"}`}
                            >
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                            <Clock size={10} />{" "}
                            {new Date(notif.createdAt).toLocaleString("vi-VN")}
                          </div>
                          <button
                            onClick={(e) =>
                              handleDeleteNotif(e, notif._id, notif.isRead)
                            }
                            className="absolute top-4 right-3 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
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

          {/* PHẦN AVATAR DROPDOWN (Giữ nguyên giao diện của Thịnh) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotifDropdownOpen(false);
              }}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}`}
              >
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-sm font-semibold text-gray-900">
                  {user?.name || "Người dùng"}
                </span>
                <span className="block text-xs text-gray-500">
                  {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-[110%] w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} /> Hồ sơ cá nhân
                </Link>
                <div className="py-1 border-t mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut size={16} /> Đăng xuất
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
