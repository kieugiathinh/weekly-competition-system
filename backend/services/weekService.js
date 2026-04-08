import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

// 1. Tạo tuần mới
const createWeekService = async (data) => {
  const { name, weekNumber, schoolYearId } = data;

  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại");

  // Kiểm tra trùng tên hoặc trùng số thứ tự trong cùng 1 năm học
  const weekExists = await Week.findOne({
    schoolYearId,
    $or: [{ name }, { weekNumber }],
  });

  if (weekExists)
    throw new Error(
      "Tên tuần hoặc Số thứ tự tuần đã tồn tại trong năm học này",
    );

  const newWeek = await Week.create(data);
  return newWeek;
};

// 2. Lấy danh sách tuần (Lọc theo năm học)
const getAllWeeksService = async (query) => {
  const filter = {};

  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }

  // Sắp xếp theo số thứ tự tuần (weekNumber) tăng dần (1 -> 52)
  const weeks = await Week.find(filter)
    .populate("schoolYearId", "name isCurrent")
    .sort({ weekNumber: 1 });

  return weeks;
};

// 3. Lấy chi tiết 1 tuần
const getWeekByIdService = async (id) => {
  const week = await Week.findById(id).populate(
    "schoolYearId",
    "name isCurrent",
  );
  if (!week) throw new Error("Không tìm thấy tuần thi đua");
  return week;
};

// 4. Cập nhật tuần (Đổi tên hoặc Khóa/Mở tuần)
const updateWeekService = async (id, updateData) => {
  const week = await Week.findById(id);
  if (!week) throw new Error("Không tìm thấy tuần thi đua");

  const { name, weekNumber, isLocked } = updateData;

  // Nếu có đổi tên hoặc đổi số, phải check xem có bị trùng với tuần khác không
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

  week.name = name || week.name;
  week.weekNumber = weekNumber || week.weekNumber;

  // Kiểm tra rõ ràng vì isLocked là Boolean (có thể là false)
  if (isLocked !== undefined) {
    week.isLocked = isLocked;
  }

  const updatedWeek = await week.save();
  return updatedWeek;
};

// 5. Xóa tuần
const deleteWeekService = async (id) => {
  const week = await Week.findById(id);
  if (!week) throw new Error("Không tìm thấy tuần thi đua");

  // TODO: Tương tự Lớp, sau này phải check nếu tuần đã có điểm thì cấm xóa.
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
