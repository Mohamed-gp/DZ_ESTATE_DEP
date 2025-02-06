import { Router } from "express";
import {
  sendMessageController,
  getUserConversationsController,
  getMessagesController,
  createRoomController,
} from "../../controllers/chatControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const chatRouter = Router();

chatRouter.post("/rooms", verifyAccessToken, createRoomController);
chatRouter.post("/messages/send", verifyAccessToken, sendMessageController);
chatRouter.get("/messages/:room_id", verifyAccessToken, getMessagesController);
chatRouter.get(
  "/conversations",
  verifyAccessToken,
  getUserConversationsController
);

export default chatRouter;
