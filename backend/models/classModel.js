import mongoose from "mongoose";

const classSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên lớp (VD: 6/1)"],
    },
    grade: {
      type: Number,
      required: [true, "Vui lòng chọn khối lớp"],
      enum: [6, 7, 8, 9],
    },
    schoolYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolYear",
      required: [true, "Lớp học phải thuộc về một năm học cụ thể"],
    },
  },
  { timestamps: true },
);

classSchema.index({ name: 1, schoolYearId: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);

export { Class };
