import { Router} from "express";
import { getUserPropertiesWishlist, togglePropertyInWishlist } from "../../controllers/userControllers";


const userRouter = Router();




userRouter.route("/wishlist").get(getUserPropertiesWishlist);
userRouter.route("/wishlist/toggle/:propertyId").post(togglePropertyInWishlist);


export default userRouter;