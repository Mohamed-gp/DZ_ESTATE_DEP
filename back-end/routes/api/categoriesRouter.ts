import { Router} from "express";
import { addCategory, getCategories, removeCategory } from "../../controllers/categoriesControllers";


const categoriesRouter = Router();




categoriesRouter.route("/").get(getCategories).post(addCategory)
categoriesRouter.route("/:id").delete(removeCategory);

export default categoriesRouter;