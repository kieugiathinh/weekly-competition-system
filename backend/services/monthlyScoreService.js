import { MonthlyScore } from "../models/monthlyScoreModel.js";
import { WeeklyScore } from "../models/weeklyScoreModel.js";
import { Month } from "../models/monthModel.js";
import { Class } from "../models/classModel.js";
import { Criterion } from "../models/criterionModel.js";

// 1. Lưu điểm phong trào Tháng
const saveMonthlyScoreService = async (data) => {
  const { monthId, classId, details } = data;

  let totalMonthlyPoint = 0;
  if (details && details.length > 0) {
    for (const item of details) {
      const criterion = await Criterion.findById(item.criterionId);
      if (criterion) {
        totalMonthlyPoint += criterion.point * item.quantity;
      }
    }
  }

  let scoreRecord = await MonthlyScore.findOne({ monthId, classId });
  if (scoreRecord) {
    scoreRecord.details = details;
    scoreRecord.totalMonthlyPoint = totalMonthlyPoint;
    await scoreRecord.save();
  } else {
    scoreRecord = await MonthlyScore.create({
      monthId,
      classId,
      details,
      totalMonthlyPoint,
    });
  }

  return scoreRecord;
};

// 2. Thuật toán Xếp hạng Tháng (Đã bao gồm điểm Tuần)
const getMonthlyRankingService = async (monthId) => {
  const month = await Month.findById(monthId);
  if (!month) throw new Error("Không tìm thấy Tháng");

  const classes = await Class.find({ schoolYearId: month.schoolYearId });
  const weekIds = month.weekIds; // Các tuần thuộc tháng này

  // Lấy toàn bộ điểm Tuần thuộc các Tuần trong Tháng
  const weeklyScores = await WeeklyScore.find({
    weekId: { $in: weekIds },
  }).populate("classId");
  // Lấy điểm Phong trào Tháng
  const monthlyScores = await MonthlyScore.find({ monthId }).populate(
    "details.criterionId",
  );

  const ranking = classes.map((cls) => {
    // 1. Tính tổng các Tuần
    const clsWeeklyScores = weeklyScores.filter(
      (ws) => ws.classId._id.toString() === cls._id.toString(),
    );
    const totalWeekPoint = clsWeeklyScores.reduce(
      (sum, ws) => sum + ws.totalScore,
      0,
    );

    // 2. Tính tổng Tháng
    const clsMonthlyScore = monthlyScores.find(
      (ms) => ms.classId.toString() === cls._id.toString(),
    );
    const totalMonthPoint = clsMonthlyScore
      ? clsMonthlyScore.totalMonthlyPoint
      : 0;

    // 3. Tính điểm chung cuộc
    const finalScore = totalWeekPoint + totalMonthPoint;

    return {
      classId: cls,
      totalWeekPoint,
      totalMonthPoint,
      finalScore,
      monthlyDetails: clsMonthlyScore ? clsMonthlyScore.details : [],
    };
  });

  ranking.sort((a, b) => b.finalScore - a.finalScore);
  return ranking;
};

export { saveMonthlyScoreService, getMonthlyRankingService };
