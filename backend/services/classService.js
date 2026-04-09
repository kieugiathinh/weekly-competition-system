import { Class } from "../models/classModel.js";
import { SchoolYear } from "../models/schoolYearModel.js";

// 1. Tạo lớp học mới
const createClassService = async (data) => {
  const { name, grade, schoolYearId } = data;

  // Kiểm tra xem năm học có tồn tại thật không
  const yearExists = await SchoolYear.findById(schoolYearId);
  if (!yearExists) throw new Error("Năm học không tồn tại trong hệ thống");

  // Kiểm tra xem lớp này đã tồn tại trong năm học đó chưa
  const classExists = await Class.findOne({ name, schoolYearId });
  if (classExists) throw new Error(`Lớp ${name} đã tồn tại trong năm học này`);

  const newClass = await Class.create(data);
  return newClass;
};

// 2. Lấy danh sách lớp học (Có hỗ trợ Query Filter)
const getAllClassesService = async (query) => {
  const filter = {};

  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }
  if (query.grade) {
    filter.grade = query.grade;
  }

  const classes = await Class.find(filter)
    .populate("schoolYearId", "name isCurrent")
    .sort({ grade: 1, name: 1 });

  return classes;
};

// 3. Lấy chi tiết 1 lớp
const getClassByIdService = async (id) => {
  const classData = await Class.findById(id).populate(
    "schoolYearId",
    "name isCurrent",
  );
  if (!classData) throw new Error("Không tìm thấy lớp học");
  return classData;
};

// 4. Cập nhật lớp học
const updateClassService = async (id, updateData) => {
  const classData = await Class.findById(id);
  if (!classData) throw new Error("Không tìm thấy lớp học");

  const { name, grade, schoolYearId } = updateData;

  if (
    (name && name !== classData.name) ||
    (schoolYearId &&
      schoolYearId.toString() !== classData.schoolYearId.toString())
  ) {
    const checkName = name || classData.name;
    const checkYearId = schoolYearId || classData.schoolYearId;

    const classExists = await Class.findOne({
      name: checkName,
      schoolYearId: checkYearId,
      _id: { $ne: id },
    });

    if (classExists)
      throw new Error(`Lớp ${checkName} đã tồn tại trong năm học này`);
  }

  classData.name = name || classData.name;
  classData.grade = grade || classData.grade;
  classData.schoolYearId = schoolYearId || classData.schoolYearId;

  const updatedClass = await classData.save();
  return updatedClass;
};

// 5. Xóa lớp học
const deleteClassService = async (id) => {
  const classData = await Class.findById(id);
  if (!classData) throw new Error("Không tìm thấy lớp học");

  await classData.deleteOne();
  return { message: "Đã xóa lớp học thành công" };
};

// 6. Sao chép lớp từ năm cũ sang năm mới
const cloneClassesService = async (fromYearId, toYearId) => {
  // Kiểm tra xem năm học đích (Năm mới) đã có lớp nào chưa
  const existingClasses = await Class.countDocuments({
    schoolYearId: toYearId,
  });
  if (existingClasses > 0) {
    throw new Error(
      "Năm học mới này đã có danh sách lớp. Không thể sao chép đè lên được.",
    );
  }

  // Lấy danh sách lớp từ năm cũ
  const oldClasses = await Class.find({ schoolYearId: fromYearId });
  if (oldClasses.length === 0) {
    throw new Error("Năm học cũ không có danh sách lớp nào để sao chép.");
  }

  // Chuẩn bị mảng dữ liệu mới
  const newClassesData = oldClasses.map((cls) => ({
    name: cls.name,
    grade: cls.grade,
    schoolYearId: toYearId,
  }));

  // Đẩy 1 lần toàn bộ vào Database
  await Class.insertMany(newClassesData);

  return {
    message: `Đã sao chép thành công ${newClassesData.length} lớp sang năm học mới.`,
  };
};

export {
  createClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
  cloneClassesService,
};
