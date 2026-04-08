import express from "express";
import {
  createWeek,
  getWeeks,
  getWeekById,
  updateWeek,
  deleteWeek,
} from "../controllers/weekController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, admin, createWeek).get(protect, getWeeks);

router
  .route("/:id")
  .get(protect, admin, getWeekById)
  .put(protect, admin, updateWeek)
  .delete(protect, admin, deleteWeek);

export default router;
