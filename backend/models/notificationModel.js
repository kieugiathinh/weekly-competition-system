import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["SYSTEM", "SCORE"],
      default: "SYSTEM",
    },
    isRead: { type: Boolean, default: false },
    targetRole: { type: String, default: "admin" },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export { Notification };
