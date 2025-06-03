import { Router } from "express";
import upload from "../../config/multer";
import {
  addPropertyController,
  getProperties,
  getProperty,
  searchPropertiesWithLocation,
  getNearbyProperties,
  getPopularLocations,
} from "../../controllers/propertiesControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";
import {
  togglePropertyInWishlist,
  getUserProperties,
  getUserPropertiesWishlist,
} from "../../controllers/userControllers";

const propertiesRouter = Router();

// Basic property routes
propertiesRouter.route("/").get(getProperties);
propertiesRouter
  .route("/add")
  .post(upload.array("files"), verifyAccessToken, addPropertyController);

// Geolocation-based routes (must come before parameterized routes)
propertiesRouter.route("/search/location").get(searchPropertiesWithLocation);
propertiesRouter.route("/nearby").get(getNearbyProperties);
propertiesRouter.route("/locations/popular").get(getPopularLocations);

// User-specific routes
propertiesRouter.route("/users/:userId").get(getUserProperties);
propertiesRouter.route("/wishlist/:userId").get(getUserPropertiesWishlist);

// Parameterized routes (must come after specific routes)
propertiesRouter.route("/:id").get(getProperty);
propertiesRouter
  .route("/:id/wishlist")
  .post(verifyAccessToken, togglePropertyInWishlist);

export default propertiesRouter;
