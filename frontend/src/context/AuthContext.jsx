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
      const { data } = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // THÊM DÒNG NÀY: Lưu Token vào Két sắt (Phải chắc chắn authController ở Backend đã return token nhé)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

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

      // THÊM DÒNG NÀY: Xóa Token khỏi Két sắt khi đăng xuất
      localStorage.removeItem("token");
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
