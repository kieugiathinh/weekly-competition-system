import mongoose from "mongoose";

const weekSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên tuần (VD: Tuần 1)"],
    },
    weekNumber: {
      type: Number,
      required: true, // Sẽ được tự động tính toán ở Service nếu không truyền lên
    },
    startDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày bắt đầu tuần"],
    },
    endDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày kết thúc tuần"],
    },
    schoolYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolYear",
      required: [true, "Tuần phải thuộc về một năm học cụ thể"],
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Đảm bảo không trùng lặp tên tuần và số thứ tự trong cùng 1 năm học
weekSchema.index({ name: 1, schoolYearId: 1 }, { unique: true });
weekSchema.index({ weekNumber: 1, schoolYearId: 1 }, { unique: true });

const Week = mongoose.model("Week", weekSchema);

export { Week };
