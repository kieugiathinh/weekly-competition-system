// import cron from "node-cron";
// import { Week } from "../models/weekModel.js";
// import { SchoolYear } from "../models/schoolYearModel.js";

// const startWeekCronJob = () => {
//   cron.schedule(
//     "* * * * *",
//     async () => {
//       console.log(
//         `[CRON JOB] Đang dọn dẹp và đồng bộ lịch tuần: ${new Date().toLocaleString("vi-VN")}`,
//       );

//       try {
//         const now = new Date();
//         const schoolYears = await SchoolYear.find();

//         for (const year of schoolYears) {
//           // 1. Tìm tuần chính danh của ngày hôm nay
//           const activeWeek = await Week.findOne({
//             schoolYearId: year._id,
//             startDate: { $lte: now },
//             endDate: { $gte: now },
//           });

//           if (activeWeek) {
//             // Mở tuần này ra
//             await Week.updateOne({ _id: activeWeek._id }, { isLocked: false });
//             // KHÓA toàn bộ các tuần còn lại trong năm học đó
//             await Week.updateMany(
//               { schoolYearId: year._id, _id: { $ne: activeWeek._id } },
//               { isLocked: true },
//             );
//             console.log(`[CRON] Đã kích hoạt Tuần: ${activeWeek.name}`);
//           } else {
//             // Nếu hôm nay không thuộc tuần nào (Lễ/Tết) -> Khóa toàn bộ để an toàn
//             await Week.updateMany(
//               { schoolYearId: year._id },
//               { isLocked: true },
//             );
//             console.log(
//               `[CRON] Không có tuần nào active. Đã khóa sổ toàn bộ Năm học: ${year.name}`,
//             );
//           }
//         }
//       } catch (error) {
//         console.error(`[CRON JOB ERROR]:`, error);
//       }
//     },
//     { scheduled: true, timezone: "Asia/Ho_Chi_Minh" },
//   );
// };

// export default startWeekCronJob;

import cron from "node-cron";
import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

const startWeekCronJob = () => {
  // Cài đặt lịch: 00:00 mỗi ngày (Phút 0, Giờ 0, Mọi ngày, Mọi tháng, Mọi thứ)
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log(
        `[CRON JOB] Đang chạy tác vụ tự động Khóa/Mở Tuần lúc: ${new Date().toLocaleString("vi-VN")}`,
      );

      try {
        const today = new Date();

        const schoolYears = await SchoolYear.find();

        for (const year of schoolYears) {
          // Tìm tuần thuộc về ngày hôm nay
          const activeWeek = await Week.findOne({
            schoolYearId: year._id,
            startDate: { $lte: today },
            endDate: { $gte: today },
          });

          if (activeWeek) {
            // Đảm bảo Tuần của hôm nay được mở
            if (activeWeek.isLocked) {
              activeWeek.isLocked = false;
              await activeWeek.save();
              console.log(`[CRON] Đã MỞ khóa Tuần: ${activeWeek.name}`);
            }

            // Khóa tất cả các tuần CÒN LẠI (dọn dẹp những tuần Admin lỡ mở bằng tay hôm qua)
            const lockedResult = await Week.updateMany(
              {
                schoolYearId: year._id,
                _id: { $ne: activeWeek._id },
                isLocked: false,
              },
              { isLocked: true },
            );

            if (lockedResult.modifiedCount > 0) {
              console.log(
                `[CRON] Đã tự động dọn dẹp và KHÓA ${lockedResult.modifiedCount} tuần cũ.`,
              );
            }
          } else {
            // Không có tuần nào của hôm nay, KHÓA toàn bộ
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
