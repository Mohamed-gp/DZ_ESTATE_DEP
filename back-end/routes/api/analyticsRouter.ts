import { Router } from "express";
import {
  getDashboardAnalytics,
  getPropertyPerformance,
  getUserEngagement,
} from "../../controllers/analyticsControllers";

const analyticsRouter = Router();

analyticsRouter.route("/dashboard").get(getDashboardAnalytics);
analyticsRouter.route("/property/:property_id").get(getPropertyPerformance);
analyticsRouter.route("/engagement").get(getUserEngagement);

export default analyticsRouter;
