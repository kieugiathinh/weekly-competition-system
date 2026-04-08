import {
  createCriterionService,
  getAllCriteriaService,
  getCriterionByIdService,
  updateCriterionService,
  deleteCriterionService,
} from "../services/criterionService.js";

const createCriterion = async (req, res) => {
  try {
    const criterion = await createCriterionService(req.body);
    res.status(201).json(criterion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCriteria = async (req, res) => {
  try {
    const criteria = await getAllCriteriaService(req.query);
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCriterionById = async (req, res) => {
  try {
    const criterion = await getCriterionByIdService(req.params.id);
    res.json(criterion);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateCriterion = async (req, res) => {
  try {
    const updatedCriterion = await updateCriterionService(
      req.params.id,
      req.body,
    );
    res.json(updatedCriterion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCriterion = async (req, res) => {
  try {
    const result = await deleteCriterionService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  createCriterion,
  getCriteria,
  getCriterionById,
  updateCriterion,
  deleteCriterion,
};
