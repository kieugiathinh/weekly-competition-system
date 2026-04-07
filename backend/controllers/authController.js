import { loginService } from "../services/authService.js";
import generateToken from "../utils/generateToken.js";

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginService(username, password);

    // Tạo token và lưu thẳng vào Cookie
    generateToken(res, user._id);

    // Trả về thông tin user (không kèm token trong JSON nữa)
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const logout = (req, res) => {
  // Xóa cookie bằng cách set thời gian hết hạn về 0
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Đăng xuất thành công" });
};

export { login, logout };
