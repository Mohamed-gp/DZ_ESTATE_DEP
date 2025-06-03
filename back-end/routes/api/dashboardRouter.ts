import { Router } from "express";
import {
  getDashboardStats,
  getPropertyAnalytics,
  getUserManagement,
  toggleUserStatus,
  getSystemAnalytics,
} from "../../controllers/dashboardControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const dashboardRouter = Router();

// All dashboard routes require authentication
dashboardRouter.use(verifyAccessToken);

// Dashboard overview
dashboardRouter.route("/stats").get(getDashboardStats);

// Property analytics
dashboardRouter
  .route("/properties/:propertyId/analytics")
  .get(getPropertyAnalytics);

// Admin-only routes
dashboardRouter.route("/users").get(getUserManagement);
dashboardRouter.route("/users/:userId/toggle-status").patch(toggleUserStatus);
dashboardRouter.route("/system/analytics").get(getSystemAnalytics);

export default dashboardRouter;
