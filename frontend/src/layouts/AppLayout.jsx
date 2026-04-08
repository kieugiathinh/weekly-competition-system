import { Outlet } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 xl:flex font-sans">
      {/* Sidebar và Lớp phủ */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* Khu vực nội dung bên phải */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out flex flex-col min-h-screen
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} 
          ${isMobileOpen ? "ml-0" : ""}
        `}
      >
        <AppHeader />

        {/* Nơi hiển thị các màn hình (Dashboard, Chấm điểm...) */}
        <main className="p-4 mx-auto max-w-7xl md:p-6 w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
