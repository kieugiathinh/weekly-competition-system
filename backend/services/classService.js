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
  // query có thể là: { schoolYearId: '123...', grade: 6 }
  const filter = {};

  if (query.schoolYearId) {
    filter.schoolYearId = query.schoolYearId;
  }
  if (query.grade) {
    filter.grade = query.grade; // Lọc theo khối nếu có truyền vào
  }

  // Lấy dữ liệu, populate để lấy thêm field 'name' và 'isCurrent' của bảng SchoolYear
  // Sort theo Khối tăng dần (6->9), sau đó sort theo Tên lớp
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

  // Nếu người dùng đổi Tên lớp HOẶC đổi Năm học -> Phải check trùng lặp
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
      _id: { $ne: id }, // Loại trừ chính nó ra
    });

    if (classExists)
      throw new Error(`Lớp ${checkName} đã tồn tại trong năm học này`);
  }

  // Cập nhật dữ liệu
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

  // TODO: Tương lai sẽ thêm logic check xem lớp đã có bảng điểm chưa ở đây

  await classData.deleteOne();
  return { message: "Đã xóa lớp học thành công" };
};

export {
  createClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
};
