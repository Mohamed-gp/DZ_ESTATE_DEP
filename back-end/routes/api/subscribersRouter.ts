import { Router } from "express";
import { subscribeToNewsletter } from "../../controllers/subscribeControllers";

const subscribersRouter = Router();

subscribersRouter.route("/").post(subscribeToNewsletter);

export default subscribersRouter;
