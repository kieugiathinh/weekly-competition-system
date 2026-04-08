import {
  createSchoolYearService,
  getAllSchoolYearsService,
  getSchoolYearByIdService,
  updateSchoolYearService,
  deleteSchoolYearService,
} from "../services/schoolYearService.js";

const createSchoolYear = async (req, res) => {
  try {
    const schoolYear = await createSchoolYearService(req.body);
    res.status(201).json(schoolYear);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSchoolYears = async (req, res) => {
  try {
    const schoolYears = await getAllSchoolYearsService();
    res.json(schoolYears);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchoolYearById = async (req, res) => {
  try {
    const schoolYear = await getSchoolYearByIdService(req.params.id);
    res.json(schoolYear);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateSchoolYear = async (req, res) => {
  try {
    const updatedSchoolYear = await updateSchoolYearService(
      req.params.id,
      req.body,
    );
    res.json(updatedSchoolYear);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSchoolYear = async (req, res) => {
  try {
    const result = await deleteSchoolYearService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  createSchoolYear,
  getSchoolYears,
  getSchoolYearById,
  updateSchoolYear,
  deleteSchoolYear,
};
