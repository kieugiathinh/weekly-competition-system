import express from "express";
import {
  createSchoolYear,
  getSchoolYears,
  getSchoolYearById,
  updateSchoolYear,
  deleteSchoolYear,
} from "../controllers/schoolYearController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, admin, createSchoolYear)
  .get(protect, admin, getSchoolYears);

router
  .route("/:id")
  .get(protect, admin, getSchoolYearById)
  .put(protect, admin, updateSchoolYear)
  .delete(protect, admin, deleteSchoolYear);

export default router;
