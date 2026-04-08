import mongoose from "mongoose";

const weeklyScoreSchema = mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    weekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Week",
      required: true,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Lưu lại ID của người đã chấm điểm (Admin hoặc bạn cờ đỏ)
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0, // Điểm này do Backend tự tính, FE không được gửi lên
    },
    details: [
      {
        criterionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Criterion",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Số lượng ít nhất phải là 1"],
        },
      },
    ],
  },
  { timestamps: true },
);

// Ràng buộc cực kỳ quan trọng: 1 Lớp trong 1 Tuần chỉ có ĐÚNG 1 bản ghi điểm
weeklyScoreSchema.index({ classId: 1, weekId: 1 }, { unique: true });

const WeeklyScore = mongoose.model("WeeklyScore", weeklyScoreSchema);

export { WeeklyScore };
