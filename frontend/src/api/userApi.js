import axiosInstance from "../utils/axiosInstance";

export const userApi = {
  getAll: async (params) => {
    const response = await axiosInstance.get("/users", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
};
