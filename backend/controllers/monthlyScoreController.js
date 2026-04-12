import {
  saveMonthlyScoreService,
  getMonthlyRankingService,
} from "../services/monthlyScoreService.js";

const saveMonthlyScore = async (req, res) => {
  try {
    const score = await saveMonthlyScoreService(req.body);
    res.status(200).json(score);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMonthlyRanking = async (req, res) => {
  try {
    const ranking = await getMonthlyRankingService(req.params.monthId);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { saveMonthlyScore, getMonthlyRanking };
