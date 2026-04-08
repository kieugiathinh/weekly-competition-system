import axiosInstance from "../utils/axiosInstance";

export const weeklyScoreApi = {
  saveScore: async (data) => {
    const response = await axiosInstance.post("/scores/save", data);
    return response.data;
  },
  getRankingByWeek: async (weekId) => {
    const response = await axiosInstance.get(`/scores/ranking/${weekId}`);
    return response.data;
  },
  deleteScore: async (id) => {
    const response = await axiosInstance.delete(`/scores/${id}`);
    return response.data;
  },
};
