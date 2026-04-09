import cron from "node-cron";
import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

const startWeekCronJob = () => {
  // Cài đặt lịch: 00:01 mỗi ngày (Phút 1, Giờ 0, Mọi ngày, Mọi tháng, Mọi thứ)
  // Múi giờ bắt buộc phải là Giờ Việt Nam
  cron.schedule(
    "1 0 * * *",
    async () => {
      console.log(
        `[CRON JOB] Đang chạy tác vụ kiểm tra Tuần thi đua lúc: ${new Date().toLocaleString("vi-VN")}`,
      );

      try {
        const today = new Date();

        // Lấy danh sách tất cả các Năm học
        const schoolYears = await SchoolYear.find();

        for (const year of schoolYears) {
          // 1. Tìm xem hôm nay rơi vào Tuần nào của Năm học này
          const activeWeek = await Week.findOne({
            schoolYearId: year._id,
            startDate: { $lte: today }, // startDate <= today
            endDate: { $gte: today }, // endDate >= today
          });

          if (activeWeek) {
            // Trường hợp A: Có 1 tuần chứa ngày hôm nay

            // Mở khóa tuần hiện tại (Nếu nó đang bị khóa)
            if (activeWeek.isLocked) {
              activeWeek.isLocked = false;
              await activeWeek.save();
              console.log(`[CRON] Đã MỞ khóa Tuần: ${activeWeek.name}`);
            }

            // Khóa tất cả các tuần CÒN LẠI trong cùng năm học đó
            const lockedResult = await Week.updateMany(
              {
                schoolYearId: year._id,
                _id: { $ne: activeWeek._id }, // Khác với ID của tuần hiện tại
                isLocked: false, // Chỉ cập nhật những tuần đang vô tình mở
              },
              { isLocked: true },
            );

            if (lockedResult.modifiedCount > 0) {
              console.log(
                `[CRON] Đã KHÓA ${lockedResult.modifiedCount} tuần cũ.`,
              );
            }
          } else {
            // Trường hợp B: Hôm nay không thuộc Tuần nào cả (Nghỉ hè, nghỉ lễ, hoặc Admin chưa tạo)
            // Để an toàn dữ liệu, tự động KHÓA toàn bộ các tuần đang mở
            const lockedAll = await Week.updateMany(
              { schoolYearId: year._id, isLocked: false },
              { isLocked: true },
            );
            if (lockedAll.modifiedCount > 0) {
              console.log(
                `[CRON] Không có tuần nào active. Đã tự động KHÓA ${lockedAll.modifiedCount} tuần.`,
              );
            }
          }
        }

        console.log(`[CRON JOB] Hoàn tất quét hệ thống!`);
      } catch (error) {
        console.error(`[CRON JOB ERROR] Lỗi khi chạy tác vụ:`, error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    },
  );
};

export default startWeekCronJob;
