import { Router } from "express";
import {
  getUserPropertiesWishlist,
  togglePropertyInWishlist,
  upgradeUserProfile,
} from "../../controllers/userControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const userRouter = Router();

userRouter.route("/wishlist").get(verifyAccessToken, getUserPropertiesWishlist);
userRouter.route("/upgradeprofile").post(verifyAccessToken, upgradeUserProfile);
userRouter
  .route("/wishlist/toggle/:propertyId")
  .post(verifyAccessToken, togglePropertyInWishlist);

export default userRouter;
