import express from "express";
import {
  createMonth,
  getMonths,
  getMonthById,
  updateMonth,
  deleteMonth,
} from "../controllers/monthController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, admin, createMonth).get(protect, getMonths);

router
  .route("/:id")
  .get(protect, admin, getMonthById)
  .put(protect, admin, updateMonth)
  .delete(protect, admin, deleteMonth);

export default router;
