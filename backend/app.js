import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import schoolYearRoutes from "./routes/schoolYearRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import criterionRoutes from "./routes/criterionRoutes.js";
import weekRoutes from "./routes/weekRoutes.js";
import weeklyScoreRoutes from "./routes/weeklyScoreRoutes.js";

const app = express();

// Middlewares
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sử dụng Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/school-years", schoolYearRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/criteria", criterionRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/scores", weeklyScoreRoutes);

app.get("/", (req, res) => {
  res.send("API Hệ thống chấm điểm thi đua đang hoạt động!");
});

export default app;
