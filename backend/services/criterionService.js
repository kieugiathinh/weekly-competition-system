import { Criterion } from "../models/criterionModel.js";

// 1. Tạo tiêu chí mới
const createCriterionService = async (data) => {
  const { name, type, point, category, scope, isActive } = data; // Thêm category và scope

  const criterionExists = await Criterion.findOne({ name });
  if (criterionExists) throw new Error("Tiêu chí này đã tồn tại");

  // Validate nhẹ: Nếu là penalty thì điểm không nên là số dương
  if (type === "penalty" && point > 0) {
    throw new Error("Tiêu chí điểm trừ thì mức điểm phải là số âm (VD: -5)");
  }
  // Nếu là bonus thì điểm không nên là số âm
  if (type === "bonus" && point < 0) {
    throw new Error(
      "Tiêu chí điểm cộng thì mức điểm phải là số dương (VD: 10)",
    );
  }

  const newCriterion = await Criterion.create(data);
  return newCriterion;
};

// 2. Lấy danh sách tiêu chí (Hỗ trợ lọc theo isActive, type, VÀ BỔ SUNG scope, category)
const getAllCriteriaService = async (query) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }
  if (query.type) {
    filter.type = query.type; // Lọc thêm theo type (bonus hoặc penalty)
  }

  // Bổ sung lọc theo phạm vi (Dùng cho trang Chấm Tuần / Chấm Tháng sau này)
  if (query.scope) {
    filter.scope = query.scope;
  }
  if (query.category) {
    filter.category = query.category;
  }

  // Sắp xếp theo phạm vi -> phân loại -> tên để dữ liệu trả về gọn gàng
  const criteria = await Criterion.find(filter).sort({
    scope: -1,
    type: 1,
    name: 1,
  });
  return criteria;
};

// 3. Lấy chi tiết 1 tiêu chí
const getCriterionByIdService = async (id) => {
  const criterion = await Criterion.findById(id);
  if (!criterion) throw new Error("Không tìm thấy tiêu chí");
  return criterion;
};

// 4. Cập nhật tiêu chí
const updateCriterionService = async (id, updateData) => {
  const criterion = await Criterion.findById(id);
  if (!criterion) throw new Error("Không tìm thấy tiêu chí");

  if (updateData.name && updateData.name !== criterion.name) {
    const criterionExists = await Criterion.findOne({ name: updateData.name });
    if (criterionExists) throw new Error("Tên tiêu chí đã bị trùng");
  }

  // Validate lại nếu người dùng có sửa điểm hoặc loại
  const newType = updateData.type || criterion.type;
  const newPoint =
    updateData.point !== undefined ? updateData.point : criterion.point;

  if (newType === "penalty" && newPoint > 0) {
    throw new Error("Tiêu chí điểm trừ thì mức điểm phải là số âm");
  }
  if (newType === "bonus" && newPoint < 0) {
    throw new Error("Tiêu chí điểm cộng thì mức điểm phải là số dương");
  }

  // TIẾN HÀNH CẬP NHẬT CÁC TRƯỜNG DỮ LIỆU
  criterion.name = updateData.name || criterion.name;
  criterion.type = updateData.type || criterion.type;
  criterion.point =
    updateData.point !== undefined ? updateData.point : criterion.point;

  // ĐÂY CHÍNH LÀ 2 DÒNG CÒN THIẾU KHIẾN BẠN BỊ LỖI
  criterion.category = updateData.category || criterion.category;
  criterion.scope = updateData.scope || criterion.scope;

  criterion.isActive =
    updateData.isActive !== undefined
      ? updateData.isActive
      : criterion.isActive;

  const updatedCriterion = await criterion.save();
  return updatedCriterion;
};

// 5. Xóa tiêu chí
const deleteCriterionService = async (id) => {
  const criterion = await Criterion.findById(id);
  if (!criterion) throw new Error("Không tìm thấy tiêu chí");

  await criterion.deleteOne();
  return { message: "Đã xóa tiêu chí thành công" };
};

export {
  createCriterionService,
  getAllCriteriaService,
  getCriterionByIdService,
  updateCriterionService,
  deleteCriterionService,
};
