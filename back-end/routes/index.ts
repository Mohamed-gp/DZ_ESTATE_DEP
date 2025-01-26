import { Router } from "express";
import authRouter from "./api/authRouter";
import userRouter from "./api/userRouter";
import propertiesRouter from "./api/propertiesRouter";
import stripeRouter from "./api/stripeRouter";


const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/properties", propertiesRouter);
router.use("/categories", propertiesRouter);
// router.use("/stripe", stripeRouter);


export default router;