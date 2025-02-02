import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/verifyToken";
import { getNotificationsController,createNotification } from "../../controllers/notificationControllers";



const notificationRouter = Router();

notificationRouter.route("/getnotifications").get(verifyAccessToken ,getNotificationsController);
notificationRouter.route("/createnotification").post(verifyAccessToken ,createNotification);

export default notificationRouter;