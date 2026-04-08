import { WeeklyScore } from "../models/weeklyScoreModel.js";
import { Week } from "../models/weekModel.js";
import { Criterion } from "../models/criterionModel.js";

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
    // Truy vấn vào CSDL để lấy mức điểm GỐC của tiêu chí đó
    const criterion = await Criterion.findById(item.criterionId);

    if (criterion) {
      // Công thức: Tổng = (Số lượng * Mức điểm) cộng dồn
      // Vì bạn đã lưu điểm trừ là số âm (VD: -4), nên cứ làm phép CỘNG bình thường
      calculatedTotalScore += item.quantity * criterion.point;

      processedDetails.push({
        criterionId: criterion._id,
        quantity: item.quantity,
      });
    }
  }

  // 1.3 Kiểm tra xem lớp này ở tuần này đã có bảng điểm chưa
  let scoreRecord = await WeeklyScore.findOne({ classId, weekId });

  if (scoreRecord) {
    // NẾU CÓ RỒI: Tiến hành Cập nhật (Ghi đè chi tiết và điểm mới)
    scoreRecord.details = processedDetails;
    scoreRecord.totalScore = calculatedTotalScore;
    scoreRecord.evaluatedBy = evaluatedBy; // Cập nhật lại người chấm mới nhất
    await scoreRecord.save();
    return { message: "Đã cập nhật điểm thành công", data: scoreRecord };
  } else {
    // NẾU CHƯA CÓ: Tạo bảng điểm mới
    const newScore = await WeeklyScore.create({
      classId,
      weekId,
      evaluatedBy,
      totalScore: calculatedTotalScore,
      details: processedDetails,
    });
    return { message: "Đã lưu điểm mới thành công", data: newScore };
  }
};

// 2. Lấy Bảng Xếp Hạng của 1 Tuần cụ thể
const getRankingByWeekService = async (weekId) => {
  const ranking = await WeeklyScore.find({ weekId })
    .populate("classId", "name grade") // Lấy tên lớp và khối
    .sort({ totalScore: -1 }); // Sắp xếp TỔNG ĐIỂM giảm dần (Lớp cao điểm nhất lên đầu)

  return ranking;
};

// 3. Xem chi tiết "Sao kê" điểm của 1 lớp trong 1 tuần
const getScoreDetailService = async (scoreId) => {
  const detail = await WeeklyScore.findById(scoreId)
    .populate("classId", "name grade")
    .populate("weekId", "name isLocked")
    .populate("evaluatedBy", "name username") // Ai là người chấm
    .populate("details.criterionId", "name type point"); // Lấy tên lỗi và mức điểm trừ/cộng

  if (!detail) throw new Error("Không tìm thấy bảng điểm");
  return detail;
};

const deleteScoreService = async (id) => {
  const score = await WeeklyScore.findById(id);
  if (!score) throw new Error("Không tìm thấy bảng điểm");

  // Kiểm tra xem tuần đó đã khóa chưa, khóa rồi thì cấm xóa
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
