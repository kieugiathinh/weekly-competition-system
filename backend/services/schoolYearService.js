import { SchoolYear } from "../models/schoolYearModel.js";

// Tạo năm học mới
const createSchoolYearService = async (data) => {
  const { name, isCurrent } = data;

  const yearExists = await SchoolYear.findOne({ name });
  if (yearExists) throw new Error("Năm học này đã tồn tại");

  // LOGIC QUAN TRỌNG: Nếu năm học mới tạo được set là "Hiện tại"
  // Thì phải tìm tất cả các năm học cũ trong DB và đổi chúng thành false
  if (isCurrent === true) {
    await SchoolYear.updateMany({}, { isCurrent: false });
  }

  const schoolYear = await SchoolYear.create(data);
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
    // Tắt hết các năm học khác đi (ngoại trừ chính nó)
    await SchoolYear.updateMany({ _id: { $ne: id } }, { isCurrent: false });
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

  // Ghi chú cho sau này: Nếu năm học này đã có Lớp học hoặc Tuần điểm,
  // bạn không nên cho xóa để bảo toàn dữ liệu. Hiện tại ta cứ xóa cứng.
  await schoolYear.deleteOne();
  return { message: "Đã xóa năm học thành công" };
};

export {
  createSchoolYearService,
  getAllSchoolYearsService,
  getSchoolYearByIdService,
  updateSchoolYearService,
  deleteSchoolYearService,
};
