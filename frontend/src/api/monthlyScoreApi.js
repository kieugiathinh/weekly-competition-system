import axiosInstance from "../utils/axiosInstance";

export const monthlyScoreApi = {
  // Lưu điểm phong trào/lao động của 1 lớp trong 1 tháng
  saveScore: async (data) => {
    const response = await axiosInstance.post("/monthly-scores/save", data);
    return response.data;
  },

  // Lấy BXH tổng hợp của tháng (Bao gồm điểm 4 Tuần + Điểm Tháng)
  getRankingByMonth: async (monthId) => {
    const response = await axiosInstance.get(
      `/monthly-scores/ranking/${monthId}`,
    );
    return response.data;
  },
};
