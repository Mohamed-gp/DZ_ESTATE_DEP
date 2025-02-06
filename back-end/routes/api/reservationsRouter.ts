import { Router } from "express";
import { reserveOrBuyProperty } from "../../controllers/reservationsControllers";

const reservationsRouter = Router();

reservationsRouter.route("/").post(reserveOrBuyProperty);

export default reservationsRouter;
