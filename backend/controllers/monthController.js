import {
  createMonthService,
  getAllMonthsService,
  getMonthByIdService,
  updateMonthService,
  deleteMonthService,
} from "../services/monthService.js";

const createMonth = async (req, res) => {
  try {
    const month = await createMonthService(req.body);
    res.status(201).json(month);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMonths = async (req, res) => {
  try {
    const months = await getAllMonthsService(req.query);
    res.json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthById = async (req, res) => {
  try {
    const month = await getMonthByIdService(req.params.id);
    res.json(month);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateMonth = async (req, res) => {
  try {
    const updatedMonth = await updateMonthService(req.params.id, req.body);
    res.json(updatedMonth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMonth = async (req, res) => {
  try {
    const result = await deleteMonthService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createMonth, getMonths, getMonthById, updateMonth, deleteMonth };
