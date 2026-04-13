import { Notification } from "../models/notificationModel.js";

const getNotificationsService = async () => {
  // Lấy 50 thông báo mới nhất cho Admin
  return await Notification.find({ targetRole: "admin" })
    .sort({ createdAt: -1 })
    .limit(50);
};

const markAsReadService = async (id) => {
  const notif = await Notification.findById(id);
  if (!notif) throw new Error("Không tìm thấy thông báo");
  notif.isRead = true;
  await notif.save();
  return { message: "Đã đánh dấu đọc" };
};

const markAllAsReadService = async () => {
  await Notification.updateMany(
    { targetRole: "admin", isRead: false },
    { isRead: true },
  );
  return { message: "Đã đánh dấu đọc tất cả" };
};

const deleteNotificationService = async (id) => {
  const notif = await Notification.findById(id);
  if (!notif) throw new Error("Không tìm thấy thông báo để xóa");
  await notif.deleteOne();
  return { message: "Đã xóa thông báo thành công" };
};

const deleteAllNotificationsService = async () => {
  await Notification.deleteMany({ targetRole: "admin" });
  return { message: "Đã xóa toàn bộ thông báo" };
};

export {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
  deleteAllNotificationsService,
};
