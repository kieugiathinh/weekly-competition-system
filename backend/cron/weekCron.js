import cron from "node-cron";
import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";
import { Notification } from "../models/notificationModel.js"; // BỔ SUNG
import { getIO } from "../socket.js"; // BỔ SUNG

const startWeekCronJob = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log(`[CRON JOB] Đang chạy tác vụ tự động Khóa/Mở Tuần...`);
      try {
        const today = new Date();
        const schoolYears = await SchoolYear.find();
        let message = ""; // Chứa nội dung thông báo

        for (const year of schoolYears) {
          const activeWeek = await Week.findOne({
            schoolYearId: year._id,
            startDate: { $lte: today },
            endDate: { $gte: today },
          });

          if (activeWeek) {
            if (activeWeek.isLocked) {
              activeWeek.isLocked = false;
              await activeWeek.save();
              message = `Hệ thống vừa tự động MỞ KHÓA ${activeWeek.name} để chấm điểm.`;
            }

            const lockedResult = await Week.updateMany(
              {
                schoolYearId: year._id,
                _id: { $ne: activeWeek._id },
                isLocked: false,
              },
              { isLocked: true },
            );
            if (lockedResult.modifiedCount > 0 && !message) {
              message = `Hệ thống vừa tự động dọn dẹp và khóa các tuần cũ.`;
            }
          } else {
            const lockedAll = await Week.updateMany(
              { schoolYearId: year._id, isLocked: false },
              { isLocked: true },
            );
            if (lockedAll.modifiedCount > 0) {
              message = `Hệ thống tự động KHÓA SỔ toàn bộ do không có tuần thi đua nào hiện hành.`;
            }
          }
        }

        // BỔ SUNG LOGIC GỬI THÔNG BÁO REALTIME:
        if (message !== "") {
          const newNotif = await Notification.create({
            title: "Cập nhật tự động (Cron Job)",
            message: message,
            type: "SYSTEM",
            targetRole: "admin",
          });

          // Phát tín hiệu tới các Admin đang online
          getIO().to("admins").emit("new_notification", newNotif);
        }

        console.log(`[CRON JOB] Hoàn tất quét hệ thống!`);
      } catch (error) {
        console.error(`[CRON JOB ERROR] Lỗi khi chạy tác vụ:`, error);
      }
    },
    { scheduled: true, timezone: "Asia/Ho_Chi_Minh" },
  );
};

export default startWeekCronJob;
