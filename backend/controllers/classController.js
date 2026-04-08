import {
  createClassService,
  getAllClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
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

// Lấy danh sách lớp (Có hỗ trợ query params để lọc)
const getClasses = async (req, res) => {
  try {
    // req.query sẽ tự động lấy các tham số trên URL
    // VD: /api/classes?schoolYearId=abc&grade=6 -> req.query = { schoolYearId: 'abc', grade: '6' }
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

export { createClass, getClasses, getClassById, updateClass, deleteClass };
