import mongoose from "mongoose";

const criterionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên tiêu chí (VD: Tiết A, Vệ sinh)"],
      unique: true,
    },
    type: {
      type: String,
      enum: ["bonus", "penalty"], // Bắt buộc phải là 1 trong 2 loại này
      required: [true, "Vui lòng chọn loại tiêu chí (Điểm cộng hoặc Điểm trừ)"],
    },
    point: {
      type: Number,
      required: [true, "Vui lòng nhập mức điểm (VD: 10, -4)"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Criterion = mongoose.model("Criterion", criterionSchema);

export { Criterion };
