import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Đọc thông tin user từ localStorage (nếu có) khi F5 tải lại trang
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      // Gọi API Login
      const { data } = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      // Cookie đã được Backend tự động gắn vào trình duyệt.
      // Ở đây ta chỉ lưu thông tin cơ bản (tên, role) vào State và LocalStorage để hiển thị UI
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));

      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("userInfo");
    } catch (error) {
      console.error("Lỗi khi đăng xuất", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
