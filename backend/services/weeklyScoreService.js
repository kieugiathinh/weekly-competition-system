import { WeeklyScore } from "../models/weeklyScoreModel.js";
import { Week } from "../models/weekModel.js";
import { Criterion } from "../models/criterionModel.js";
import { Class } from "../models/classModel.js"; // Bổ sung import Class
import { Notification } from "../models/notificationModel.js"; // Bổ sung
import { getIO } from "../socket.js"; // Bổ sung

// 1. Lưu điểm (Gộp chung Tạo mới và Cập nhật - Upsert)
const saveScoreService = async (data) => {
  const { classId, weekId, evaluatedBy, details } = data;

  // 1.1 Kiểm tra xem Tuần thi đua này có đang bị "Khóa" không?
  const week = await Week.findById(weekId);
  if (!week) throw new Error("Không tìm thấy tuần thi đua");
  if (week.isLocked) {
    throw new Error(
      "Tuần thi đua này đã chốt sổ (Khóa). Không thể nhập hay sửa điểm!",
    );
  }

  // 1.2 Thuật toán tính tổng điểm tự động (Backend nắm quyền sinh sát)
  let calculatedTotalScore = 0;
  const processedDetails = [];

  // Lặp qua mảng details mà Frontend gửi lên
  for (const item of details) {
    const criterion = await Criterion.findById(item.criterionId);

    if (criterion) {
      calculatedTotalScore += item.quantity * criterion.point;

      processedDetails.push({
        criterionId: criterion._id,
        quantity: item.quantity,
      });
    }
  }

  // 1.3 Kiểm tra xem lớp này ở tuần này đã có bảng điểm chưa
  let scoreRecord = await WeeklyScore.findOne({ classId, weekId });
  let savedData;
  let returnMsg = "";

  if (scoreRecord) {
    scoreRecord.details = processedDetails;
    scoreRecord.totalScore = calculatedTotalScore;
    scoreRecord.evaluatedBy = evaluatedBy;
    savedData = await scoreRecord.save();
    returnMsg = "Đã cập nhật điểm thành công";
  } else {
    savedData = await WeeklyScore.create({
      classId,
      weekId,
      evaluatedBy,
      totalScore: calculatedTotalScore,
      details: processedDetails,
    });
    returnMsg = "Đã lưu điểm mới thành công";
  }

  // --- BẮT ĐẦU LOGIC PHÁT THÔNG BÁO REALTIME ---
  try {
    const cls = await Class.findById(classId);
    if (cls && week) {
      // 1. Lưu vào CSDL
      const newNotif = await Notification.create({
        title: "Có cập nhật điểm Tuần",
        message: `Lớp ${cls.name} vừa được cập nhật điểm cho ${week.name}. Tổng điểm: ${calculatedTotalScore}`,
        type: "SCORE",
        targetRole: "admin",
      });

      // 2. Phát Socket tới các Admin đang online
      getIO().to("admins").emit("new_notification", newNotif);
    }
  } catch (err) {
    console.error("Lỗi khi tạo thông báo điểm tuần:", err);
  }
  // --- KẾT THÚC LOGIC THÔNG BÁO ---

  return { message: returnMsg, data: savedData };
};

// 2. Lấy Bảng Xếp Hạng của 1 Tuần cụ thể
const getRankingByWeekService = async (weekId) => {
  const ranking = await WeeklyScore.find({ weekId })
    .populate("classId", "name grade")
    .sort({ totalScore: -1 });

  return ranking;
};

// 3. Xem chi tiết "Sao kê" điểm của 1 lớp trong 1 tuần
const getScoreDetailService = async (scoreId) => {
  const detail = await WeeklyScore.findById(scoreId)
    .populate("classId", "name grade")
    .populate("weekId", "name isLocked")
    .populate("evaluatedBy", "name username")
    .populate("details.criterionId", "name type point");

  if (!detail) throw new Error("Không tìm thấy bảng điểm");
  return detail;
};

const deleteScoreService = async (id) => {
  const score = await WeeklyScore.findById(id);
  if (!score) throw new Error("Không tìm thấy bảng điểm");

  const week = await Week.findById(score.weekId);
  if (week && week.isLocked)
    throw new Error("Tuần này đã khóa sổ, không thể xóa điểm!");

  await score.deleteOne();
  return { message: "Đã xóa bảng điểm (Reset thành Chưa chấm)" };
};

export {
  saveScoreService,
  getRankingByWeekService,
  getScoreDetailService,
  deleteScoreService,
};
