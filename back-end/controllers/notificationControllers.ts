import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import logger from "../utils/logger";

// Get all notifications for a user
const getNotifications = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await pool.query(
      `
      SELECT 
        id,
        title,
        message,
        type,
        read_status,
        created_at,
        data
      FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: notifications.rows,
      message: "Notifications retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    return next(error);
  }
};

// Mark notification as read
const markAsRead = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { notification_id } = req.params;

    await pool.query(
      `
      UPDATE notifications 
      SET read_status = true 
      WHERE id = $1 AND user_id = $2
    `,
      [notification_id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    return next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `
      UPDATE notifications 
      SET read_status = true 
      WHERE user_id = $1 AND read_status = false
    `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    return next(error);
  }
};

// Create notification (internal function)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "booking" | "payment" | "message" | "property" | "system",
  data?: any
) => {
  try {
    const notification = await pool.query(
      `
      INSERT INTO notifications (user_id, title, message, type, data, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `,
      [userId, title, message, type, JSON.stringify(data)]
    );

    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification.rows[0];
  } catch (error) {
    logger.error("Error creating notification:", error);
    throw error;
  }
};

// Get unread count
const getUnreadCount = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const count = await pool.query(
      `
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = $1 AND read_status = false
    `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { unread_count: parseInt(count.rows[0].unread_count) },
      message: "Unread count retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching unread count:", error);
    return next(error);
  }
};

// Delete notification
const deleteNotification = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { notification_id } = req.params;

    await pool.query(
      `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
    `,
      [notification_id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting notification:", error);
    return next(error);
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
