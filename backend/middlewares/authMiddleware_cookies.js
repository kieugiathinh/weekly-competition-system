import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const protect = async (req, res, next) => {
  // Lấy token từ cookie có tên là 'jwt'
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Không có quyền truy cập, token không hợp lệ" });
    }
  } else {
    res
      .status(401)
      .json({ message: "Không có quyền truy cập, không tìm thấy token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Không có quyền truy cập, yêu cầu quyền Admin" });
  }
};

export { protect, admin };
