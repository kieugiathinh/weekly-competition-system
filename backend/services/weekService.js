import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

// 1. Tạo tuần mới
const createWeekService = async (data) => {
  const { name, startDate, endDate, schoolYearId } = data;
  let { weekNumber } = data;

  // Kiểm tra năm học
  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại");

  // Logic validate Ngày tháng
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("Ngày kết thúc phải nằm sau ngày bắt đầu");
  }

  // LOGIC TỰ ĐỘNG TÍNH SỐ THỨ TỰ TUẦN
  if (!weekNumber) {
    const lastWeek = await Week.findOne({ schoolYearId }).sort({
      weekNumber: -1,
    });
    weekNumber = lastWeek ? lastWeek.weekNumber + 1 : 1;
    data.weekNumber = weekNumber;
  }

  // Kiểm tra trùng lặp
  const weekExists = await Week.findOne({
    schoolYearId,
    $or: [{ name }, { weekNumber }],
  });

  if (weekExists)
    throw new Error(
      "Tên tuần hoặc Số thứ tự tuần đã tồn tại trong năm học này",
    );

  // LOGIC ĐỘC QUYỀN TRẠNG THÁI MỞ:
  // Nếu tuần mới được tạo ra không bị khóa (mặc định là Mở)
  if (data.isLocked !== true) {
    // Tự động KHÓA tất cả các tuần cũ trong cùng một năm học
    await Week.updateMany({ schoolYearId }, { isLocked: true });
  }

  const newWeek = await Week.create(data);
  return newWeek;
};

// 2. Lấy danh sách tuần
const getAllWeeksService = async (query) => {
  const filter = {};
  if (query.schoolYearId) filter.schoolYearId = query.schoolYearId;

  const weeks = await Week.find(filter)
    .populate("schoolYearId", "name isCurrent")
    .sort({ weekNumber: 1 });

  return weeks;
};

// 3. Lấy chi tiết
const getWeekByIdService = async (id) => {
  const week = await Week.findById(id).populate(
    "schoolYearId",
    "name isCurrent",
  );
  if (!week) throw new Error("Không tìm thấy tuần thi đua");
  return week;
};

// 4. Cập nhật tuần
const updateWeekService = async (id, updateData) => {
  const week = await Week.findById(id);
  if (!week) throw new Error("Không tìm thấy tuần thi đua");

  const { name, weekNumber, startDate, endDate, isLocked } = updateData;

  // Validate ngày tháng
  if (startDate && endDate) {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("Ngày kết thúc phải nằm sau ngày bắt đầu");
    }
  } else if (startDate) {
    if (new Date(startDate) >= new Date(week.endDate))
      throw new Error(
        "Ngày bắt đầu không được vượt qua ngày kết thúc hiện tại",
      );
  } else if (endDate) {
    if (new Date(week.startDate) >= new Date(endDate))
      throw new Error("Ngày kết thúc phải sau ngày bắt đầu hiện tại");
  }

  // Check trùng lặp
  if (
    (name && name !== week.name) ||
    (weekNumber && weekNumber !== week.weekNumber)
  ) {
    const checkName = name || week.name;
    const checkNumber = weekNumber || week.weekNumber;

    const weekExists = await Week.findOne({
      schoolYearId: week.schoolYearId,
      _id: { $ne: id },
      $or: [{ name: checkName }, { weekNumber: checkNumber }],
    });

    if (weekExists) throw new Error("Tên tuần hoặc Số thứ tự tuần đã bị trùng");
  }

  // LOGIC ĐỘC QUYỀN TRẠNG THÁI MỞ (Khi Update):
  // Nếu người dùng đang MỞ KHÓA tuần này (từ true chuyển thành false)
  if (isLocked === false && week.isLocked === true) {
    // Tự động Khóa tất cả các tuần khác trong cùng năm học
    await Week.updateMany(
      { schoolYearId: week.schoolYearId, _id: { $ne: id } },
      { isLocked: true },
    );
  }

  // Cập nhật dữ liệu
  week.name = name || week.name;
  if (weekNumber !== undefined) week.weekNumber = weekNumber;
  if (startDate) week.startDate = startDate;
  if (endDate) week.endDate = endDate;
  if (isLocked !== undefined) week.isLocked = isLocked;

  const updatedWeek = await week.save();
  return updatedWeek;
};

// 5. Xóa tuần
const deleteWeekService = async (id) => {
  const week = await Week.findById(id);
  if (!week) throw new Error("Không tìm thấy tuần thi đua");
  await week.deleteOne();
  return { message: "Đã xóa tuần thi đua thành công" };
};

export {
  createWeekService,
  getAllWeeksService,
  getWeekByIdService,
  updateWeekService,
  deleteWeekService,
};
