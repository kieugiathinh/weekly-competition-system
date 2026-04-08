import express from "express";
import {
  createCriterion,
  getCriteria,
  getCriterionById,
  updateCriterion,
  deleteCriterion,
} from "../controllers/criterionController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route: /api/criteria
router
  .route("/")
  .post(protect, admin, createCriterion) // Chỉ admin được tạo
  .get(protect, getCriteria); // Ai đăng nhập cũng được xem danh sách

// Route: /api/criteria/:id
router
  .route("/:id")
  .get(protect, admin, getCriterionById) // Chỉ admin xem chi tiết
  .put(protect, admin, updateCriterion) // Chỉ admin được sửa
  .delete(protect, admin, deleteCriterion); // Chỉ admin được xóa

export default router;
