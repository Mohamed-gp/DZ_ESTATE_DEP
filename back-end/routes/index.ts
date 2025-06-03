import { Router } from "express";
import authRouter from "./api/authRouter";
import userRouter from "./api/userRouter";
import propertiesRouter from "./api/propertiesRouter";
import stripeRouter from "./api/stripeRouter";
import chatRouter from "./api/chatRouter";
import analyticsRouter from "./api/analyticsRouter";
import notificationRouter from "./api/notificationRouter";
import categoriesRouter from "./api/categoriesRouter";
import adminRouter from "./api/adminRouter";
import featuresRouter from "./api/featuresRouter";
import subscribersRouter from "./api/subscribersRouter";
import reviewsRouter from "./api/reviewsRouter";
import reservationsRouter from "./api/reservationsRouter";
import dashboardRouter from "./api/dashboardRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/properties", propertiesRouter);
router.use("/users", userRouter);
router.use("/reservations", reservationsRouter);
router.use("/reviews", reviewsRouter);
router.use("/categories", categoriesRouter);
router.use("/subscribers", subscribersRouter);
router.use("/features", featuresRouter);
router.use("/stripe", stripeRouter);
router.use("/chat", chatRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/analytics", analyticsRouter);
router.use("/notifications", notificationRouter);

export default router;
