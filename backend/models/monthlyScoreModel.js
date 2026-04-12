import mongoose from "mongoose";

const monthlyScoreSchema = mongoose.Schema(
  {
    monthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Month",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    details: [
      {
        criterionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Criterion",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalMonthlyPoint: { type: Number, default: 0 },
  },
  { timestamps: true },
);

monthlyScoreSchema.index({ monthId: 1, classId: 1 }, { unique: true });

const MonthlyScore = mongoose.model("MonthlyScore", monthlyScoreSchema);

export { MonthlyScore };
