import { Router } from "express";
const reviewsRouter = Router();
import {
  addReview,
  getReviewsForProperty,
  updateReview,
  deleteReview,
} from "../../controllers/reviewsControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

reviewsRouter.route("/").post(verifyAccessToken, addReview);
reviewsRouter
  .route("/:id")
  .get(getReviewsForProperty)
  .delete(verifyAccessToken, deleteReview)
  .put(verifyAccessToken, updateReview);

export default reviewsRouter;
