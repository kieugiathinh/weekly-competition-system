import {
  createClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
  cloneClassesService,
} from "../services/classService.js";

// Tạo lớp mới
const createClass = async (req, res) => {
  try {
    const newClass = await createClassService(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách lớp
const getClasses = async (req, res) => {
  try {
    const classes = await getAllClassesService(req.query);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 lớp
const getClassById = async (req, res) => {
  try {
    const classData = await getClassByIdService(req.params.id);
    res.json(classData);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật thông tin lớp
const updateClass = async (req, res) => {
  try {
    const updatedClass = await updateClassService(req.params.id, req.body);
    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa lớp
const deleteClass = async (req, res) => {
  try {
    const result = await deleteClassService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sao chép lớp học
const cloneClasses = async (req, res) => {
  try {
    const { fromYearId, toYearId } = req.body;
    if (!fromYearId || !toYearId) {
      return res
        .status(400)
        .json({ message: "Thiếu ID của năm học cũ hoặc năm học mới" });
    }

    const result = await cloneClassesService(fromYearId, toYearId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  cloneClasses,
};
