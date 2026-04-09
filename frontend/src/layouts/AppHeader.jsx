import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext"; // Thêm AuthContext
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth(); // Lấy thông tin user đang đăng nhập
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const dropdownRef = useRef(null); // Ref để nhận diện click outside

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border lg:border-gray-200 transition-colors"
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

        {/* KHU VỰC AVATAR & DROPDOWN (Bên phải) */}
        <div
          className="flex items-center gap-4 px-5 py-4 lg:px-0 relative"
          ref={dropdownRef}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
          >
            {/* Avatar chữ cái đầu */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white
              ${user?.role === "admin" ? "bg-blue-600" : "bg-orange-500"}
            `}
            >
              {getInitials(user?.name)}
            </div>

            {/* Tên và Vai trò (Ẩn trên mobile) */}
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
              {/* Header của Dropdown (Hiển thị lại tên trên mobile) */}
              <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                <span className="block text-sm font-semibold text-gray-900">
                  {user?.name || "Người dùng"}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {user?.role === "admin" ? "Tổng phụ trách" : "Đội cờ đỏ"}
                </span>
              </div>

              {/* Các menu item */}
              <div className="py-1">
                {/* Sau này bạn có thể link đến trang Profile chứa các Component của Tailadmin */}
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
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
