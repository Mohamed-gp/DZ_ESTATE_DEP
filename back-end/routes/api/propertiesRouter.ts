import { Router } from "express";
import upload from "../../config/multer";
import { addPropertyController, getProperties, getProperty } from "../../controllers/propertiesControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";
import { togglePropertyInWishlist, getUserProperties, getUserPropertiesWishlist } from "../../controllers/userControllers";


const propertiesRouter = Router();


// propertiesRouter.route("/").get();
propertiesRouter.route("/").get(getProperties);
propertiesRouter.route("/add").post(upload.array("files"),verifyAccessToken,addPropertyController);
propertiesRouter.route("/users/:userId").get(getUserProperties);
propertiesRouter.route("/:id").get(getProperty);
// propertiesRouter.route("/images/:id").get(getPropertyImages);
// propertiesRouter.route("/add").post(upload.array("files"),verifyAccessToken,addPropertyController);
// propertiesRouter.post("/:id/reserve/stripe", addReservationWithStripe);




export default propertiesRouter;