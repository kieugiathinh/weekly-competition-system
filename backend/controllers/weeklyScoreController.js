import {
  saveScoreService,
  getRankingByWeekService,
  getScoreDetailService,
} from "../services/weeklyScoreService.js";

// Lưu hoặc cập nhật điểm
const saveScore = async (req, res) => {
  try {
    const data = {
      ...req.body,
      evaluatedBy: req.user._id, // Lấy ID từ token (middleware protect đã gắn vào)
    };

    const result = await saveScoreService(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy bảng xếp hạng theo tuần
const getRankingByWeek = async (req, res) => {
  try {
    const ranking = await getRankingByWeekService(req.params.weekId);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 bảng điểm
const getScoreDetail = async (req, res) => {
  try {
    const detail = await getScoreDetailService(req.params.id);
    res.json(detail);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export { saveScore, getRankingByWeek, getScoreDetail };
