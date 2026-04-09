import { SchoolYear } from "../models/schoolYearModel.js";
import { Class } from "../models/classModel.js";
import { Week } from "../models/weekModel.js";

// Tạo năm học mới
const createSchoolYearService = async (data) => {
  const { name, isCurrent } = data;

  const yearExists = await SchoolYear.findOne({ name });
  if (yearExists) throw new Error("Năm học này đã tồn tại");

  // LOGIC QUAN TRỌNG: Nếu năm học mới tạo được set là "Hiện tại"
  if (isCurrent === true) {
    // 1. Tắt isCurrent của tất cả các năm học khác
    await SchoolYear.updateMany({}, { isCurrent: false });
  }

  const schoolYear = await SchoolYear.create(data);

  // 2. Khóa sổ toàn bộ các Tuần KHÔNG thuộc về năm học mới này
  if (isCurrent === true) {
    await Week.updateMany(
      { schoolYearId: { $ne: schoolYear._id } },
      { isLocked: true },
    );
    console.log(`[HỆ THỐNG] Đã tự động khóa sổ các tuần của năm học cũ.`);
  }

  return schoolYear;
};

// Lấy danh sách tất cả năm học (Sắp xếp mới nhất lên đầu)
const getAllSchoolYearsService = async () => {
  return await SchoolYear.find({}).sort({ createdAt: -1 });
};

// Lấy chi tiết 1 năm học
const getSchoolYearByIdService = async (id) => {
  const schoolYear = await SchoolYear.findById(id);
  if (!schoolYear) throw new Error("Không tìm thấy năm học");
  return schoolYear;
};

// Cập nhật năm học
const updateSchoolYearService = async (id, updateData) => {
  const schoolYear = await SchoolYear.findById(id);
  if (!schoolYear) throw new Error("Không tìm thấy năm học");

  // LOGIC QUAN TRỌNG: Nếu đang từ false đổi thành true
  if (updateData.isCurrent === true && schoolYear.isCurrent === false) {
    // 1. Tắt hết các năm học khác đi (ngoại trừ chính nó)
    await SchoolYear.updateMany({ _id: { $ne: id } }, { isCurrent: false });

    // 2. Khóa sổ toàn bộ các Tuần của các năm học khác
    await Week.updateMany({ schoolYearId: { $ne: id } }, { isLocked: true });
    console.log(`[HỆ THỐNG] Đã tự động khóa sổ các tuần của năm học cũ.`);
  }

  schoolYear.name = updateData.name || schoolYear.name;

  if (updateData.isCurrent !== undefined) {
    schoolYear.isCurrent = updateData.isCurrent;
  }

  const updatedSchoolYear = await schoolYear.save();
  return updatedSchoolYear;
};

// Xóa năm học
const deleteSchoolYearService = async (id) => {
  const schoolYear = await SchoolYear.findById(id);
  if (!schoolYear) throw new Error("Không tìm thấy năm học");

  // 1. Xóa tất cả Lớp học thuộc năm này
  await Class.deleteMany({ schoolYearId: id });

  // 2. Xóa tất cả các Tuần thuộc năm này
  await Week.deleteMany({ schoolYearId: id });

  // 3. Cuối cùng mới xóa Năm học
  await schoolYear.deleteOne();

  return { message: "Đã xóa năm học và dọn sạch dữ liệu liên quan." };
};

export {
  createSchoolYearService,
  getAllSchoolYearsService,
  getSchoolYearByIdService,
  updateSchoolYearService,
  deleteSchoolYearService,
};
