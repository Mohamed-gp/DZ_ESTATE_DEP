import { Router } from "express";
import { getAnalytics } from "../../controllers/analyticsControllers";
const analyticsRouter = Router();


analyticsRouter.route("/").get(getAnalytics);


export default analyticsRouter;

