import {
  createWeekService,
  getAllWeeksService,
  getWeekByIdService,
  updateWeekService,
  deleteWeekService,
} from "../services/weekService.js";

const createWeek = async (req, res) => {
  try {
    const week = await createWeekService(req.body);
    res.status(201).json(week);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getWeeks = async (req, res) => {
  try {
    const weeks = await getAllWeeksService(req.query);
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWeekById = async (req, res) => {
  try {
    const week = await getWeekByIdService(req.params.id);
    res.json(week);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateWeek = async (req, res) => {
  try {
    const updatedWeek = await updateWeekService(req.params.id, req.body);
    res.json(updatedWeek);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteWeek = async (req, res) => {
  try {
    const result = await deleteWeekService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createWeek, getWeeks, getWeekById, updateWeek, deleteWeek };
