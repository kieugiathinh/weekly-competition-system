// import { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import { useAuth } from "../context/AuthContext";
// import {
//   LayoutDashboard,
//   PenTool,
//   Users,
//   ListChecks,
//   Calendar,
//   CalendarRange,
//   ShieldCheck,
//   MoreHorizontal,
//   BookOpen,
// } from "lucide-react";

// // IMPORT LOGO TỪ THƯ MỤC ASSETS
// import logo from "../assets/logothcstranphu.jpg";

// // MENU ĐƯỢC TÙY BIẾN CHO DỰ ÁN CỦA BẠN
// const navItems = [
//   { name: "Bảng điều khiển", icon: <LayoutDashboard size={20} />, path: "/" },
//   { name: "Chấm điểm tuần", icon: <PenTool size={20} />, path: "/scoring" },
//   { name: "Quản lý Lớp học", icon: <Users size={20} />, path: "/classes" },
//   {
//     name: "Quản lý Tiêu chí",
//     icon: <ListChecks size={20} />,
//     path: "/criteria",
//   },
//   { name: "Quản lý Tuần", icon: <CalendarRange size={20} />, path: "/weeks" },
//   {
//     name: "Quản lý Năm học",
//     icon: <Calendar size={20} />,
//     path: "/school-years",
//   },
//   { name: "Tài khoản", icon: <ShieldCheck size={20} />, path: "/users" },
//   { name: "Hướng dẫn sử dụng", icon: <BookOpen size={20} />, path: "/guide" },
// ];

// const AppSidebar = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();
//   const isActive = (path) => location.pathname === path;

//   const { user } = useAuth();

//   const filteredNavItems = navItems.filter((nav) => {
//     if (user?.role === "admin") return true;
//     return nav.path === "/" || nav.path === "/scoring";
//   });

//   return (
//     <aside
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-sm
//         ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* KHU VỰC LOGO & TÊN ỨNG DỤNG */}
//       <div className="py-6 flex justify-center border-b border-gray-100 mb-4">
//         <Link to="/" className="flex flex-col items-center gap-2">
//           {/* Logo bo tròn */}
//           <img
//             src={logo}
//             alt="Logo"
//             className={`rounded-full object-cover border-2 border-blue-100 shadow-sm transition-all duration-300
//               ${isExpanded || isHovered || isMobileOpen ? "w-16 h-16" : "w-12 h-12"}`}
//           />

//           {/* Tên ứng dụng (Chỉ hiện khi mở rộng Sidebar) */}
//           {(isExpanded || isHovered || isMobileOpen) && (
//             <div className="text-center mt-1 animate-in fade-in duration-300">
//               <span className="block text-[13px] font-extrabold text-blue-700 uppercase tracking-wide leading-snug">
//                 Ứng dụng quản lý
//               </span>
//               <span className="block text-xs font-semibold text-blue-500 uppercase mt-0.5">
//                 Thi đua tuần
//               </span>
//             </div>
//           )}
//         </Link>
//       </div>

//       {/* DANH SÁCH MENU */}
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Quản lý chung"
//                 ) : (
//                   <MoreHorizontal size={24} />
//                 )}
//               </h2>

//               <ul className="flex flex-col gap-2">
//                 {/* Dùng filteredNavItems thay vì navItems */}
//                 {filteredNavItems.map((nav) => (
//                   <li key={nav.name}>
//                     <Link
//                       to={nav.path}
//                       className={`flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group
//                         ${
//                           isActive(nav.path)
//                             ? "bg-blue-50 text-blue-600"
//                             : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
//                         }
//                         ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
//                       `}
//                     >
//                       <span
//                         className={`${isActive(nav.path) ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`}
//                       >
//                         {nav.icon}
//                       </span>
//                       {(isExpanded || isHovered || isMobileOpen) && (
//                         <span>{nav.name}</span>
//                       )}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </nav>
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PenTool,
  Users,
  ListChecks,
  Calendar,
  CalendarDays,
  CalendarRange,
  ShieldCheck,
  MoreHorizontal,
  BookOpen,
  Award,
} from "lucide-react";

import logo from "../assets/logothcstranphu.jpg";

const navItems = [
  { name: "Bảng điều khiển", icon: <LayoutDashboard size={20} />, path: "/" },
  { name: "Chấm điểm tuần", icon: <PenTool size={20} />, path: "/scoring" },
  {
    name: "Chấm điểm tháng",
    icon: <Award size={20} />,
    path: "/monthly-scoring",
  },
  { name: "Quản lý Lớp học", icon: <Users size={20} />, path: "/classes" },
  {
    name: "Quản lý Tiêu chí",
    icon: <ListChecks size={20} />,
    path: "/criteria",
  },
  { name: "Quản lý Tuần", icon: <CalendarRange size={20} />, path: "/weeks" },
  { name: "Quản lý Tháng", icon: <CalendarDays size={20} />, path: "/months" },
  {
    name: "Quản lý Năm học",
    icon: <Calendar size={20} />,
    path: "/school-years",
  },
  { name: "Tài khoản", icon: <ShieldCheck size={20} />, path: "/users" },
  { name: "Hướng dẫn sử dụng", icon: <BookOpen size={20} />, path: "/guide" },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const { user } = useAuth();

  // Lọc menu: Admin thấy hết, User thấy Dashboard, Chấm điểm và Hướng dẫn
  const filteredNavItems = navItems.filter((nav) => {
    if (user?.role === "admin") return true;
    return nav.path === "/" || nav.path === "/scoring" || nav.path === "/guide";
  });

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-sm
        ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-6 flex justify-center border-b border-gray-100 mb-4">
        <Link to="/" className="flex flex-col items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className={`rounded-full object-cover border-2 border-blue-100 shadow-sm transition-all duration-300
              ${isExpanded || isHovered || isMobileOpen ? "w-16 h-16" : "w-12 h-12"}`}
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="text-center mt-1 animate-in fade-in duration-300">
              <span className="block text-[13px] font-extrabold text-blue-700 uppercase tracking-wide leading-snug">
                Ứng dụng quản lý
              </span>
              <span className="block text-xs font-semibold text-blue-500 uppercase mt-0.5">
                Thi đua tuần
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs font-semibold uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Quản lý chung"
                ) : (
                  <MoreHorizontal size={24} />
                )}
              </h2>

              <ul className="flex flex-col gap-2">
                {filteredNavItems.map((nav) => (
                  <li key={nav.name}>
                    <Link
                      to={nav.path}
                      className={`flex items-center gap-3 px-3 py-2.5 font-medium rounded-lg transition-colors group
                        ${
                          isActive(nav.path)
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        }
                        ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                      `}
                    >
                      <span
                        className={`${isActive(nav.path) ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span>{nav.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
