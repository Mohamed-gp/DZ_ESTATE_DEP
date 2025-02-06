import { Router } from "express";
import { reserveOrBuyProperty } from "../../controllers/reservationsControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const reservationsRouter = Router();

reservationsRouter.route("/").post(verifyAccessToken, reserveOrBuyProperty);

export default reservationsRouter;
