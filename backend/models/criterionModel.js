import mongoose from "mongoose";

const criterionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    point: { type: Number, required: true },
    type: { type: String, enum: ["bonus", "penalty"], required: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Vui lòng chọn danh mục cho tiêu chí"],
    },

    scope: {
      type: String,
      enum: ["week", "month"],
      default: "week",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Criterion = mongoose.model("Criterion", criterionSchema);
