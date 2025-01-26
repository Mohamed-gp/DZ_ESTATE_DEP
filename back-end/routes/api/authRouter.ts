import { Router } from "express";
import { handleRefreshToken,forgetPasswordController, loginController, logoutController, registerController } from "../../controllers/authControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";


const authRouter = Router();

authRouter.route("/login").post(loginController)
authRouter.route("/register").post(registerController);
authRouter.route("/logout").post(verifyAccessToken,logoutController)
authRouter.route("/forgetpassword").post(forgetPasswordController)
authRouter.route("/refreshToken").post(handleRefreshToken)



export default authRouter;  