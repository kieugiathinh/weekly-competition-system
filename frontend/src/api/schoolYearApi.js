import axiosInstance from "../utils/axiosInstance";

export const schoolYearApi = {
  // Lấy danh sách năm học
  getAll: async () => {
    const response = await axiosInstance.get("/school-years");
    return response.data;
  },

  // Tạo mới năm học
  create: async (data) => {
    const response = await axiosInstance.post("/school-years", data);
    return response.data;
  },

  // Cập nhật năm học
  update: async (id, data) => {
    const response = await axiosInstance.put(`/school-years/${id}`, data);
    return response.data;
  },

  // Xóa năm học
  delete: async (id) => {
    const response = await axiosInstance.delete(`/school-years/${id}`);
    return response.data;
  },
};
