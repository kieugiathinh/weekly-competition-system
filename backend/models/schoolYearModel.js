import mongoose from "mongoose";

const schoolYearSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên năm học (VD: 2025-2026)"],
      unique: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const SchoolYear = mongoose.model("SchoolYear", schoolYearSchema);

export { SchoolYear };
