import { Router } from "express";
import { getAllUsers,removeUser } from "../../controllers/adminControllers";
const adminRouter = Router();


adminRouter.route("/users").get(getAllUsers)
adminRouter.route("/users/:id").delete(removeUser);


export default adminRouter;

