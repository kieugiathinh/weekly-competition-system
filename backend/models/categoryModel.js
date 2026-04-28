import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên danh mục"],
    },
    scope: {
      type: String,
      enum: ["week", "month"],
      default: "week",
      required: [true, "Danh mục phải thuộc phạm vi Tuần hoặc Tháng"],
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1, scope: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export { Category };
