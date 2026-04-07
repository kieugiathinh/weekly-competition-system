import express from "express";
import {
  registerUser,
  getUsers,
  updateUser,
  removeUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, admin, registerUser)
  .get(protect, admin, getUsers);

router
  .route("/:id")
  .put(protect, admin, updateUser)
  .delete(protect, admin, removeUser);

export default router;
