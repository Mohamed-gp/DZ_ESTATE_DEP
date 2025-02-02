import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { ioResponse } from "../interfaces/authInterface";





const createRoomController = async (req: Request, res: Response, next: NextFunction) => {
  const { propertyId, firstUserId} = req.body;

  try {
    // Retrieve the property details
    const propertyResult = await pool.query(
      "SELECT p.title, p.owner_id, pa.asset_url AS image FROM properties p LEFT JOIN property_assets pa ON p.id = pa.property_id WHERE p.id = $1 AND pa.type = 'image' LIMIT 1",
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyResult.rows[0];

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
      [firstUserId, property.owner_id, property.image]
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
const sendMessageController = async (req: Request, res: ioResponse, next: NextFunction) => {
    
  const { chat_id, user_id, message } = req.body;

  if (!chat_id || !user_id || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Insert the message into the database
    const newMessage = await pool.query(
      "INSERT INTO messages (chat_id, user_id, message) VALUES ($1, $2, $3) RETURNING *",
      [chat_id, user_id, message]
    );

    // Emit the message to the chat room using Socket.IO
    res.io.to(chat_id).emit("new_message", newMessage.rows[0]);

    res.status(201).json({ message: "Message sent successfully.", data: newMessage.rows[0] });
  } catch (err) {
    console.error("Error in sendMessageController:", err.message);
    next(err);
  }
};

/**
 * @method GET
 * @access Private
 * @description Get all messages in a chat
 * @route /api/messages/:chat_id
 */
const getMessagesController = async (req: Request, res: Response, next: NextFunction) => {
  const { chat_id } = req.params;

  if (!chat_id) {
    return res.status(400).json({ message: "Chat ID is required." });
  }

  try {
    // Fetch messages for the chat
    const messages = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chat_id]
    );

    res.status(200).json({ data: messages.rows,message : "Messages fetched successfully." });
  } catch (err) {
    console.log("Error in getMessagesController:", err.message);
    next(err);
  }
};


const getUserConversationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { user_id } = req.params;
  
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." });
    }
  
    try {
      // Query to fetch all conversations for the user
      const conversations = await pool.query(
        `
        SELECT c.chat_id, c.chat_name, c.created_at, 
            json_agg(json_build_object('user_id', cu.user_id, 'username', u.username)) AS participants
        FROM chats c
        INNER JOIN chat_users cu ON c.chat_id = cu.chat_id
        INNER JOIN users u ON cu.user_id = u.user_id
        WHERE c.chat_id IN (
          SELECT chat_id FROM chat_users WHERE user_id = $1
        )
        GROUP BY c.chat_id
        ORDER BY c.created_at DESC
        `,
        [user_id]
      );
  
      res.status(200).json({ data: conversations.rows,message : "Conversations fetched successfully." });
    } catch (err) {
      console.error("Error in getUserConversationsController:", err.message);
      next(err);
    }
};



export { sendMessageController, getMessagesController ,getUserConversationsController };
