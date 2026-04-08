import express from "express";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, admin, createClass)
  .get(protect, admin, getClasses);

router
  .route("/:id")
  .get(protect, admin, getClassById)
  .put(protect, admin, updateClass)
  .delete(protect, admin, deleteClass);

export default router;
