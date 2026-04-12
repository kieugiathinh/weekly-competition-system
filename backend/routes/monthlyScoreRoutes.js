import express from "express";
import {
  saveMonthlyScore,
  getMonthlyRanking,
} from "../controllers/monthlyScoreController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, admin, saveMonthlyScore);
router.get("/ranking/:monthId", protect, getMonthlyRanking);

export default router;
