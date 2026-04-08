// File: src/context/SidebarContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// Tạo Context
const SidebarContext = createContext(undefined);

// Custom Hook để sử dụng Context dễ dàng hơn ở các Component khác
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar phải được bọc bên trong SidebarProvider");
  }
  return context;
};

// Provider bọc ngoài ứng dụng
export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Lắng nghe sự kiện thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Chiều rộng dưới 768px coi là Mobile
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false); // Đóng sidebar mobile nếu chuyển sang màn hình to
      }
    };

    handleResize(); // Chạy lần đầu khi load trang
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
