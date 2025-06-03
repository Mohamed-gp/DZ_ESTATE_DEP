import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from "../../controllers/notificationControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(verifyAccessToken);

// Get all notifications for authenticated user
notificationRouter.route("/").get(getNotifications);

// Get unread notifications count
notificationRouter.route("/unread-count").get(getUnreadCount);

// Mark all notifications as read
notificationRouter.route("/mark-all-read").put(markAllAsRead);

// Mark specific notification as read or delete it
notificationRouter
  .route("/:notification_id")
  .put(markAsRead)
  .delete(deleteNotification);

export default notificationRouter;
