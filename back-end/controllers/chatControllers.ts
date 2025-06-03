import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest, ioResponse } from "../interfaces/authInterface";

const createRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { propertyId, firstUserId } = req.body;

  try {
    // Retrieve the property details
    const propertyResult = await pool.query(
      "SELECT p.title, p.owner_id FROM properties p WHERE p.id = $1",
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyResult.rows[0];

    // Retrieve the property image
    const imageResult = await pool.query(
      "SELECT asset_url FROM property_assets WHERE property_id = $1 AND type = 'image' LIMIT 1",
      [propertyId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Property image not found" });
    }

    const propertyImage = imageResult.rows[0].asset_url;

    // Retrieve the owner details
    const ownerResult = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [property.owner_id]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const owner = ownerResult.rows[0];

    // Create a new chat room
    const roomResult = await pool.query(
      "INSERT INTO rooms (user1_id, user2_id, picture, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
      [firstUserId, property.owner_id, propertyImage]
    );

    const room = roomResult.rows[0];

    return res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
};

/**
 * @method POST
 * @access Private
 * @description Send a message in a chat
 * @route /api/messages/send
 */
const sendMessageController = async (
  req: Request,
  res: ioResponse,
  next: NextFunction
): Promise<Response | void> => {
  const { room_id, user_id, message } = req.body;

  if (!room_id || !user_id || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newMessage = await pool.query(
      "INSERT INTO messages (room_id, sender_id, message, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
      [room_id, user_id, message]
    );

    if (res.io) {
      res.io.emit("new_message", newMessage.rows[0]);
    }

    return res.status(201).json({
      message: "Message sent successfully.",
      data: newMessage.rows[0],
    });
  } catch (error) {
    console.error(
      "Error in sendMessageController:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return next(error);
  }
};

/**
 * @method GET
 * @access Private
 * @description Get all messages in a chat
 * @route /api/messages/:room_id
 */
const getMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { room_id } = req.params;

  if (!room_id) {
    return res.status(400).json({ message: "Room ID is required." });
  }

  try {
    const messages = await pool.query(
      "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC",
      [room_id]
    );

    return res.status(200).json({
      data: messages.rows,
      message: "Messages fetched successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @method GET
 * @access Private
 * @description Get all conversations for a user
 * @route /api/conversations
 */
const getUserConversationsController = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const user = req.user;
  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const conversations = await pool.query(
      `SELECT r.id AS room_id, r.created_at, r.picture,
          json_agg(json_build_object('user_id', u.id, 'username', u.username)) AS participants
      FROM rooms r
      INNER JOIN users u ON u.id = ANY(ARRAY[r.user1_id, r.user2_id])
      WHERE r.user1_id = $1 OR r.user2_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC`,
      [user.id]
    );

    return res.status(200).json({
      data: conversations.rows,
      message: "Conversations fetched successfully.",
    });
  } catch (error) {
    console.error(
      "Error in getUserConversationsController:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return next(error);
  }
};

export {
  createRoomController,
  sendMessageController,
  getMessagesController,
  getUserConversationsController,
};
