import mongoose from "mongoose";

const monthSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên tháng (VD: Tháng 9)"],
    },
    schoolYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolYear",
      required: [true, "Tháng phải thuộc về một năm học cụ thể"],
    },
    weekIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Week",
      },
    ],
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

monthSchema.index({ name: 1, schoolYearId: 1 }, { unique: true });

const Month = mongoose.model("Month", monthSchema);

export { Month };
