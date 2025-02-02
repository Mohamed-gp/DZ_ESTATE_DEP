import { Router} from "express";
import { getFeatures,addFeature,removeFeature } from "../../controllers/featuresControllers";

const featuresRouter = Router();




featuresRouter.route("/").get(getFeatures).post(addFeature)
featuresRouter.route("/:id").delete(removeFeature);

export default featuresRouter;