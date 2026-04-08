import axiosInstance from "../utils/axiosInstance";

export const criterionApi = {
  // Lấy danh sách tiêu chí (có thể truyền params để lọc theo type hoặc isActive)
  getAll: async (params) => {
    const response = await axiosInstance.get("/criteria", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/criteria", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/criteria/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/criteria/${id}`);
    return response.data;
  },
};
