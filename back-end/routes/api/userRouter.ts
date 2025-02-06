import { Router } from "express";
import {
  getUserPropertiesWishlist,
  togglePropertyInWishlist,
} from "../../controllers/userControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const userRouter = Router();

userRouter.route("/wishlist").get(verifyAccessToken, getUserPropertiesWishlist);
userRouter.route("/upgradeProfile").post();
userRouter.route("/wishlist/toggle/:propertyId").post(togglePropertyInWishlist);

export default userRouter;
