import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, admin, getNotifications)
  .delete(protect, admin, deleteAllNotifications);

router.route("/mark-all").put(protect, admin, markAllAsRead);

router
  .route("/:id")
  .put(protect, admin, markAsRead)
  .delete(protect, admin, deleteNotification);

export default router;
