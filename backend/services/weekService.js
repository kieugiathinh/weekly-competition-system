// import { Week } from "../models/weekModel.js";
// import { SchoolYear } from "../models/schoolYearModel.js";

// // 1. Tạo tuần mới
// const createWeekService = async (data) => {
//   const { name, startDate, endDate, schoolYearId } = data;

//   const yearExists = await SchoolYear.findById(schoolYearId);
//   if (!yearExists) throw new Error("Năm học không tồn tại");

//   // Ép mốc thời gian chuẩn xác
//   const start = new Date(startDate);
//   start.setHours(0, 0, 0, 0);
//   const end = new Date(endDate);
//   end.setHours(23, 59, 59, 999);

//   if (start > end)
//     throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc");

//   const nameExists = await Week.findOne({ name, schoolYearId });
//   if (nameExists)
//     throw new Error(`Tuần "${name}" đã tồn tại trong năm học này`);

//   const overlappingWeek = await Week.findOne({
//     schoolYearId,
//     startDate: { $lte: end },
//     endDate: { $gte: start },
//   });

//   if (overlappingWeek) {
//     throw new Error(`Thời gian trùng lặp với ${overlappingWeek.name}`);
//   }

//   const existingWeeksCount = await Week.countDocuments({ schoolYearId });
//   data.weekNumber = existingWeeksCount + 1;
//   data.startDate = start;
//   data.endDate = end;

//   // Tính toán trạng thái tự động dựa trên thời gian thực
//   const now = new Date().getTime();
//   const isNowActive = now >= start.getTime() && now <= end.getTime();
//   data.isLocked = !isNowActive;

//   // Nếu tuần mới tạo là tuần hiện tại (MỞ), hãy KHÓA tất cả các tuần khác trong năm học này
//   if (data.isLocked === false) {
//     await Week.updateMany({ schoolYearId }, { isLocked: true });
//   }

//   const newWeek = await Week.create(data);
//   return newWeek;
// };

// // 2. Lấy danh sách Tuần
// const getAllWeeksService = async (query) => {
//   const filter = {};
//   if (query.schoolYearId) filter.schoolYearId = query.schoolYearId;

//   return await Week.find(filter)
//     .populate("schoolYearId", "name isCurrent")
//     .sort({ startDate: 1 });
// };

// // 3. Lấy chi tiết 1 tuần
// const getWeekByIdService = async (id) => {
//   const weekData = await Week.findById(id).populate(
//     "schoolYearId",
//     "name isCurrent",
//   );
//   if (!weekData) throw new Error("Không tìm thấy Tuần thi đua");
//   return weekData;
// };

// // 4. Cập nhật Tuần (Quan trọng nhất: Xử lý logic Mở/Khóa linh hoạt)
// const updateWeekService = async (id, updateData) => {
//   const weekData = await Week.findById(id);
//   if (!weekData) throw new Error("Không tìm thấy Tuần thi đua");

//   const sId = updateData.schoolYearId || weekData.schoolYearId;
//   const start = updateData.startDate
//     ? new Date(updateData.startDate)
//     : new Date(weekData.startDate);
//   const end = updateData.endDate
//     ? new Date(updateData.endDate)
//     : new Date(weekData.endDate);
//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);

//   // Kiểm tra trùng lặp thời gian
//   if (updateData.startDate || updateData.endDate) {
//     const overlapping = await Week.findOne({
//       _id: { $ne: id },
//       schoolYearId: sId,
//       startDate: { $lte: end },
//       endDate: { $gte: start },
//     });
//     if (overlapping) throw new Error(`Trùng lịch với ${overlapping.name}`);
//   }

//   // LOGIC ĐỘC QUYỀN: Nếu Admin yêu cầu MỞ (isLocked = false)
//   if (updateData.isLocked === false) {
//     // Tự động KHÓA tất cả các tuần khác trong cùng năm học
//     await Week.updateMany(
//       { schoolYearId: sId, _id: { $ne: id } },
//       { isLocked: true },
//     );
//   }

//   // Cập nhật dữ liệu
//   weekData.name = updateData.name || weekData.name;
//   weekData.startDate = start;
//   weekData.endDate = end;
//   weekData.schoolYearId = sId;
//   if (updateData.isLocked !== undefined)
//     weekData.isLocked = updateData.isLocked;

//   return await weekData.save();
// };

// // 5. Xóa tuần
// const deleteWeekService = async (id) => {
//   const weekData = await Week.findById(id);
//   if (!weekData) throw new Error("Không tìm thấy tuần");
//   await weekData.deleteOne();
//   return { message: "Đã xóa tuần thành công" };
// };

// export {
//   createWeekService,
//   getAllWeeksService,
//   getWeekByIdService,
//   updateWeekService,
//   deleteWeekService,
// };

import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

const getVNDateString = (dateInput) => {
  if (typeof dateInput === "string" && dateInput.length === 10)
    return dateInput;
  return new Date(dateInput)
    .toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" })
    .split(" ")[0];
};

// 1. Tạo tuần mới
const createWeekService = async (data) => {
  const { name, startDate, endDate, schoolYearId } = data;

  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại");

  // FIX TIMEZONE: Ép chính xác 00:00:00 và 23:59:59 theo múi giờ Việt Nam (+07:00)
  const startStr = getVNDateString(startDate);
  const start = new Date(`${startStr}T00:00:00.000+07:00`);

  const endStr = getVNDateString(endDate);
  const end = new Date(`${endStr}T23:59:59.999+07:00`);

  if (start > end) {
    throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
  }

  const nameExists = await Week.findOne({ name, schoolYearId });
  if (nameExists)
    throw new Error(`Tuần "${name}" đã tồn tại trong năm học này`);

  const overlappingWeek = await Week.findOne({
    schoolYearId: schoolYearId,
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlappingWeek) {
    const formattedStart = new Date(
      overlappingWeek.startDate,
    ).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const formattedEnd = new Date(overlappingWeek.endDate).toLocaleDateString(
      "vi-VN",
      { timeZone: "Asia/Ho_Chi_Minh" },
    );
    throw new Error(
      `Thời gian bị trùng lặp với ${overlappingWeek.name} (từ ${formattedStart} đến ${formattedEnd})`,
    );
  }

  const existingWeeksCount = await Week.countDocuments({ schoolYearId });
  data.weekNumber = existingWeeksCount + 1;
  data.startDate = start;
  data.endDate = end;

  const now = new Date().getTime();
  const isNowActive = now >= start.getTime() && now <= end.getTime();
  data.isLocked = !isNowActive;

  if (data.isLocked === false) {
    await Week.updateMany({ schoolYearId }, { isLocked: true });
  }

  const newWeek = await Week.create(data);
  return newWeek;
};

// 2. Lấy danh sách Tuần
const getAllWeeksService = async (query) => {
  const filter = {};
  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }

  const weeks = await Week.find(filter)
    .populate("schoolYearId", "name isCurrent")
    .sort({ startDate: 1 });

  return weeks;
};

// 3. Lấy chi tiết 1 tuần
const getWeekByIdService = async (id) => {
  const weekData = await Week.findById(id).populate(
    "schoolYearId",
    "name isCurrent",
  );
  if (!weekData) throw new Error("Không tìm thấy Tuần thi đua");
  return weekData;
};

// 4. Cập nhật Tuần
const updateWeekService = async (id, updateData) => {
  const weekData = await Week.findById(id);
  if (!weekData) throw new Error("Không tìm thấy Tuần thi đua");

  const checkName = updateData.name || weekData.name;

  // FIX TIMEZONE CHO UPDATE
  const startStr = getVNDateString(updateData.startDate || weekData.startDate);
  const start = new Date(`${startStr}T00:00:00.000+07:00`);

  const endStr = getVNDateString(updateData.endDate || weekData.endDate);
  const end = new Date(`${endStr}T23:59:59.999+07:00`);

  if (start > end) {
    throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
  }

  if (updateData.name && updateData.name !== weekData.name) {
    const nameExists = await Week.findOne({
      name: checkName,
      schoolYearId: updateData.schoolYearId || weekData.schoolYearId,
      _id: { $ne: id },
    });
    if (nameExists)
      throw new Error(`Tuần "${checkName}" đã tồn tại trong năm học này`);
  }

  if (updateData.startDate || updateData.endDate) {
    const overlappingWeek = await Week.findOne({
      _id: { $ne: id },
      schoolYearId: updateData.schoolYearId || weekData.schoolYearId,
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingWeek) {
      const formattedStart = new Date(
        overlappingWeek.startDate,
      ).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
      const formattedEnd = new Date(overlappingWeek.endDate).toLocaleDateString(
        "vi-VN",
        { timeZone: "Asia/Ho_Chi_Minh" },
      );
      throw new Error(
        `Thời gian bị trùng lặp với ${overlappingWeek.name} (từ ${formattedStart} đến ${formattedEnd})`,
      );
    }
  }

  weekData.name = checkName;
  weekData.startDate = start;
  weekData.endDate = end;
  weekData.schoolYearId = updateData.schoolYearId || weekData.schoolYearId;

  if (updateData.isLocked !== undefined) {
    weekData.isLocked = updateData.isLocked;
    if (weekData.isLocked === false) {
      await Week.updateMany(
        { schoolYearId: weekData.schoolYearId, _id: { $ne: id } },
        { isLocked: true },
      );
    }
  } else {
    const now = new Date().getTime();
    weekData.isLocked = now < start.getTime() || now > end.getTime();
    if (weekData.isLocked === false) {
      await Week.updateMany(
        { schoolYearId: weekData.schoolYearId, _id: { $ne: id } },
        { isLocked: true },
      );
    }
  }

  const updatedWeek = await weekData.save();
  return updatedWeek;
};

// 5. Xóa tuần
const deleteWeekService = async (id) => {
  const weekData = await Week.findById(id);
  if (!weekData) throw new Error("Không tìm thấy Tuần thi đua");

  await weekData.deleteOne();
  return { message: "Đã xóa Tuần thi đua thành công" };
};

export {
  createWeekService,
  getAllWeeksService,
  getWeekByIdService,
  updateWeekService,
  deleteWeekService,
};
