import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

const loginService = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

  // Chuyển logic check password từ Model sang đây
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
};

export { loginService };
