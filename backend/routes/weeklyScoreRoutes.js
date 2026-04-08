import express from "express";
import {
  saveScore,
  getRankingByWeek,
  getScoreDetail,
} from "../controllers/weeklyScoreController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route lưu điểm: /api/scores/save
router.post("/save", protect, saveScore);

// Route lấy BXH của 1 tuần: /api/scores/ranking/:weekId
router.get("/ranking/:weekId", protect, getRankingByWeek);

// Route xem chi tiết: /api/scores/:id
router.get("/:id", protect, getScoreDetail);

export default router;
