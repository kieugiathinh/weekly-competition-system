import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

const createUserService = async (userData) => {
  const { username, password, name, role } = userData;
  const userExists = await User.findOne({ username });
  if (userExists) throw new Error("Người dùng đã tồn tại");

  // Mã hóa mật khẩu trước khi lưu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    role,
  });
  return user;
};

const getAllUsersService = async () => {
  return await User.find({}).select("-password");
};

const updateUserService = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");

  user.name = updateData.name || user.name;
  user.role = updateData.role || user.role;

  // Nếu có cập nhật mật khẩu thì hash lại
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updateData.password, salt);
  }

  const updatedUser = await user.save();
  return updatedUser;
};

const deleteUserService = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");
  await user.deleteOne();
  return { message: "Đã xóa người dùng thành công" };
};

export {
  createUserService,
  getAllUsersService,
  updateUserService,
  deleteUserService,
};
