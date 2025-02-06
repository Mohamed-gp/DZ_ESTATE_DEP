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

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/properties", propertiesRouter);
router.use("/categories", categoriesRouter);
router.use("/chat", chatRouter);
router.use("/analytics", analyticsRouter);
router.use("/notifications", notificationRouter);
router.use("/admin", adminRouter);
router.use("/features", featuresRouter);
router.use("/subscribers", subscribersRouter);
router.use("/reservations", reservationsRouter);
router.use("/reviews", reviewsRouter);
router.use("/webhook", stripeRouter);

export default router;
