import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// THÊM INTERCEPTOR: Tự động kẹp Token vào Header trước khi gửi request
axiosInstance.interceptors.request.use(
  (config) => {
    // Móc token từ Két sắt ra
    const token = localStorage.getItem("token");
    if (token) {
      // Dán thẻ bài vào Header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
