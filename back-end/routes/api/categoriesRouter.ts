import { Router} from "express";
import { getCategories } from "../../controllers/categoriesControllers";


const userRouter = Router();




userRouter.route("/").get(getCategories);

export default userRouter;