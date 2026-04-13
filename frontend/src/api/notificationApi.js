import axiosInstance from "../utils/axiosInstance";

export const notificationApi = {
  getAll: async () => {
    const response = await axiosInstance.get("/notifications");
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axiosInstance.put("/notifications/mark-all");
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },
  deleteAll: async () => {
    const response = await axiosInstance.delete("/notifications");
    return response.data;
  },
};
