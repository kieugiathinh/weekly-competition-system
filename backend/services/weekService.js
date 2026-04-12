import { Week } from "../models/weekModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

// 1. Tạo tuần mới
const createWeekService = async (data) => {
  const { name, startDate, endDate, schoolYearId, isLocked } = data;

  // Kiểm tra năm học có tồn tại không
  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại");

  // Kiểm tra logic thời gian cơ bản
  if (new Date(startDate) > new Date(endDate)) {
    throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
  }

  // Kiểm tra trùng Tên tuần trong cùng 1 năm học
  const nameExists = await Week.findOne({ name, schoolYearId });
  if (nameExists)
    throw new Error(`Tuần "${name}" đã tồn tại trong năm học này`);

  // LOGIC QUAN TRỌNG: KIỂM TRA TRÙNG LỊCH (OVERLAPPING)
  const overlappingWeek = await Week.findOne({
    schoolYearId: schoolYearId,
    startDate: { $lte: endDate }, // Ngày BĐ (cũ) <= Ngày KT (mới)
    endDate: { $gte: startDate }, // Ngày KT (cũ) >= Ngày BĐ (mới)
  });

  if (overlappingWeek) {
    const formattedStart = new Date(
      overlappingWeek.startDate,
    ).toLocaleDateString("vi-VN");
    const formattedEnd = new Date(overlappingWeek.endDate).toLocaleDateString(
      "vi-VN",
    );
    throw new Error(
      `Thời gian bị trùng lặp với ${overlappingWeek.name} (từ ${formattedStart} đến ${formattedEnd})`,
    );
  }

  // ĐÂY LÀ PHẦN FIX LỖI 400: TỰ ĐỘNG TÍNH TOÁN weekNumber
  const existingWeeksCount = await Week.countDocuments({ schoolYearId });
  data.weekNumber = existingWeeksCount + 1; // Gán số thứ tự tự động

  // Tiến hành lưu vào Database
  const newWeek = await Week.create(data);
  return newWeek;
};

// 2. Lấy danh sách Tuần
const getAllWeeksService = async (query) => {
  const filter = {};
  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }

  // Lấy danh sách và sort theo startDate tăng dần
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
  const checkStartDate = updateData.startDate || weekData.startDate;
  const checkEndDate = updateData.endDate || weekData.endDate;
  const checkYearId = updateData.schoolYearId || weekData.schoolYearId;

  // Kiểm tra logic thời gian cơ bản
  if (new Date(checkStartDate) > new Date(checkEndDate)) {
    throw new Error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
  }

  // Kiểm tra trùng Tên
  if (updateData.name && updateData.name !== weekData.name) {
    const nameExists = await Week.findOne({
      name: checkName,
      schoolYearId: checkYearId,
      _id: { $ne: id },
    });
    if (nameExists)
      throw new Error(`Tuần "${checkName}" đã tồn tại trong năm học này`);
  }

  // LOGIC QUAN TRỌNG: KIỂM TRA TRÙNG LỊCH KHI SỬA (Bỏ qua chính nó)
  if (updateData.startDate || updateData.endDate) {
    const overlappingWeek = await Week.findOne({
      _id: { $ne: id }, // Không tự so sánh với chính mình
      schoolYearId: checkYearId,
      startDate: { $lte: checkEndDate },
      endDate: { $gte: checkStartDate },
    });

    if (overlappingWeek) {
      const formattedStart = new Date(
        overlappingWeek.startDate,
      ).toLocaleDateString("vi-VN");
      const formattedEnd = new Date(overlappingWeek.endDate).toLocaleDateString(
        "vi-VN",
      );
      throw new Error(
        `Thời gian bị trùng lặp với ${overlappingWeek.name} (từ ${formattedStart} đến ${formattedEnd})`,
      );
    }
  }

  // Tiến hành lưu
  weekData.name = checkName;
  weekData.startDate = checkStartDate;
  weekData.endDate = checkEndDate;
  weekData.schoolYearId = checkYearId;

  if (updateData.isLocked !== undefined) {
    weekData.isLocked = updateData.isLocked;
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
