import axiosInstance from "../utils/axiosInstance";

export const classApi = {
  getAll: async (params) => {
    const response = await axiosInstance.get("/classes", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/classes", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/classes/${id}`);
    return response.data;
  },

  clone: async (data) => {
    const response = await axiosInstance.post("/classes/clone", data);
    return response.data;
  },
};
