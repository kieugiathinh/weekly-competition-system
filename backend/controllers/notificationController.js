import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
  deleteAllNotificationsService,
} from "../services/notificationService.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsService();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const result = await markAsReadService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await markAllAsReadService();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const result = await deleteNotificationService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const result = await deleteAllNotificationsService();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
