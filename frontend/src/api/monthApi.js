import axiosInstance from "../utils/axiosInstance";

export const monthApi = {
  getAll: async (params) => {
    const response = await axiosInstance.get("/months", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/months", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/months/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/months/${id}`);
    return response.data;
  },
};
