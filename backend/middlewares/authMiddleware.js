import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const protect = async (req, res, next) => {
  let token;

  // 1. Ưu tiên tìm token trong Header (do Frontend gửi lên qua Bearer)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Dự phòng: Tìm trong cookie (giữ lại để tương thích cũ nếu cần)
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

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
