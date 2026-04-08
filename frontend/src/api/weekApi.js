import axiosInstance from "../utils/axiosInstance";

export const weekApi = {
  // Lấy danh sách tuần (hỗ trợ truyền filter theo schoolYearId nếu cần)
  getAll: async (params) => {
    const response = await axiosInstance.get("/weeks", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/weeks", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/weeks/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/weeks/${id}`);
    return response.data;
  },
};
