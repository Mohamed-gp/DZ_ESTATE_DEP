import { Router } from "express";
import {
  getAllUsers,
  removeProperty,
  removeUser,
  getAllProperties,
} from "../../controllers/adminControllers";
const adminRouter = Router();

adminRouter.route("/users").get(getAllUsers);
adminRouter.route("/properties").get(getAllProperties);
adminRouter.route("/users/:id").delete(removeUser);
adminRouter.route("/properties/:id").delete(removeProperty);

export default adminRouter;
