import { Month } from "../models/monthModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

// 1. Tạo Tháng mới
const createMonthService = async (data) => {
  const { name, schoolYearId, weekIds, isLocked } = data;

  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại");

  const nameExists = await Month.findOne({ name, schoolYearId });
  if (nameExists) throw new Error(`"${name}" đã tồn tại trong năm học này`);

  const newMonth = await Month.create(data);
  return newMonth;
};

// 2. Lấy danh sách Tháng
const getAllMonthsService = async (query) => {
  const filter = {};
  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }

  // Populate lấy thông tin Năm học và chi tiết các Tuần bên trong
  const months = await Month.find(filter)
    .populate("schoolYearId", "name isCurrent")
    .populate("weekIds", "name startDate endDate isLocked")
    .sort({ createdAt: 1 });

  return months;
};

// 3. Lấy chi tiết 1 Tháng
const getMonthByIdService = async (id) => {
  const monthData = await Month.findById(id)
    .populate("schoolYearId", "name isCurrent")
    .populate("weekIds", "name startDate endDate");
  if (!monthData) throw new Error("Không tìm thấy Tháng");
  return monthData;
};

// 4. Cập nhật Tháng (Ví dụ: Thêm bớt tuần, đổi tên, khóa sổ)
const updateMonthService = async (id, updateData) => {
  const monthData = await Month.findById(id);
  if (!monthData) throw new Error("Không tìm thấy Tháng");

  const checkName = updateData.name || monthData.name;
  const checkYearId = updateData.schoolYearId || monthData.schoolYearId;

  if (updateData.name && updateData.name !== monthData.name) {
    const nameExists = await Month.findOne({
      name: checkName,
      schoolYearId: checkYearId,
      _id: { $ne: id },
    });
    if (nameExists) throw new Error(`"${checkName}" đã tồn tại`);
  }

  monthData.name = checkName;
  monthData.schoolYearId = checkYearId;

  if (updateData.weekIds) monthData.weekIds = updateData.weekIds;
  if (updateData.isLocked !== undefined)
    monthData.isLocked = updateData.isLocked;

  const updatedMonth = await monthData.save();
  return updatedMonth;
};

// 5. Xóa Tháng
const deleteMonthService = async (id) => {
  const monthData = await Month.findById(id);
  if (!monthData) throw new Error("Không tìm thấy Tháng");

  await monthData.deleteOne();
  return { message: "Đã xóa Tháng thành công" };
};

export {
  createMonthService,
  getAllMonthsService,
  getMonthByIdService,
  updateMonthService,
  deleteMonthService,
};
