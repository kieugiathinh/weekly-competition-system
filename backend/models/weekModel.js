import mongoose from "mongoose";

const weekSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên tuần (VD: Tuần 1)"],
    },
    weekNumber: {
      type: Number,
      required: [true, "Vui lòng nhập số thứ tự tuần để sắp xếp (VD: 1, 2)"],
    },
    schoolYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolYear",
      required: [true, "Tuần phải thuộc về một năm học cụ thể"],
    },
    isLocked: {
      type: Boolean,
      default: false, // Mới tạo ra thì mặc định là mở (để nhập điểm)
    },
  },
  { timestamps: true },
);

// Đảm bảo trong 1 năm học không có 2 tuần trùng số thứ tự hoặc trùng tên
weekSchema.index({ name: 1, schoolYearId: 1 }, { unique: true });
weekSchema.index({ weekNumber: 1, schoolYearId: 1 }, { unique: true });

const Week = mongoose.model("Week", weekSchema);

export { Week };
