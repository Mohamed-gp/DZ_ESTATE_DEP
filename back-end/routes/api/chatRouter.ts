import { Router } from "express";
import { sendMessageController,getUserConversationsController,getMessagesController } from "../../controllers/chatControllers";

const chatRouter = Router();


chatRouter.route("/sendmessage").post(sendMessageController);
chatRouter.route("/getallconverstaions").get(getUserConversationsController);
chatRouter.route("/getmessages").get(getMessagesController);
chatRouter.route("/getallmessages").get();


export default chatRouter;

