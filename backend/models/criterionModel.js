import mongoose from "mongoose";

const criterionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    point: { type: Number, required: true },
    type: { type: String, enum: ["bonus", "penalty"], required: true },

    category: {
      type: String,
      required: true,
      default: "Khác",
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
