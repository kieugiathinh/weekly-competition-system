import { createContext, useContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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

      // Lưu State và LocalStorage
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
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
