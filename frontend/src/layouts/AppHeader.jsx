import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { Menu, Search } from "lucide-react";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef(null);

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

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:py-4">
          {/* NÚT MỞ RỘNG/THU GỌN SIDEBAR */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 lg:border lg:border-gray-200"
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

        {/* KHU VỰC AVATAR (Bên phải) */}
        <div className="flex items-center gap-4 px-5 py-4 lg:px-0">
          <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              AD
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-sm font-medium text-gray-900">
                Admin
              </span>
              <span className="block text-xs text-gray-500">
                Tổng phụ trách
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
