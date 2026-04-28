import { Category } from "../models/categoryModel.js";

const createCategoryService = async (data) => {
  const { name, scope, description, isActive } = data;

  const categoryExists = await Category.findOne({ name, scope });
  if (categoryExists) {
    throw new Error(
      `Danh mục "${name}" đã tồn tại trong phạm vi ${scope === "week" ? "Tuần" : "Tháng"}`,
    );
  }

  const newCategory = await Category.create({
    name,
    scope,
    description,
    isActive,
  });
  return newCategory;
};

const getAllCategoriesService = async (query) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.scope) {
    filter.scope = query.scope;
  }

  const categories = await Category.find(filter).sort({ scope: 1, name: 1 });
  return categories;
};

const getCategoryByIdService = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Không tìm thấy danh mục");
  return category;
};

const updateCategoryService = async (id, updateData) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Không tìm thấy danh mục");

  // Kiểm tra trùng tên nếu có thay đổi tên hoặc scope
  const nameToCheck = updateData.name || category.name;
  const scopeToCheck = updateData.scope || category.scope;

  if (updateData.name || updateData.scope) {
    const categoryExists = await Category.findOne({
      name: nameToCheck,
      scope: scopeToCheck,
      _id: { $ne: id },
    });
    if (categoryExists)
      throw new Error("Tên danh mục đã tồn tại trong phạm vi này");
  }

  category.name = updateData.name || category.name;
  category.scope = updateData.scope || category.scope;
  category.description =
    updateData.description !== undefined
      ? updateData.description
      : category.description;
  category.isActive =
    updateData.isActive !== undefined ? updateData.isActive : category.isActive;

  const updatedCategory = await category.save();
  return updatedCategory;
};

const deleteCategoryService = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Không tìm thấy danh mục");

  await category.deleteOne();
  return { message: "Đã xóa danh mục thành công" };
};

export {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
};
