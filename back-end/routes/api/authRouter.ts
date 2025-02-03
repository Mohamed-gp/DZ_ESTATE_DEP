import { Router } from "express";
import {
  handleRefreshToken,
  forgetPasswordController,
  loginController,
  logoutController,
  registerController,
  googleSignInController,
  changePassword,
} from "../../controllers/authControllers";
import { verifyAccessToken } from "../../middlewares/verifyToken";

const authRouter = Router();

authRouter.route("/login").post(loginController);
authRouter.route("/register").post(registerController);
// authRouter.route("/logout").post(verifyAccessToken,logoutController)
authRouter.route("/logout").post(logoutController);
authRouter.route("/forgetpassword").post(forgetPasswordController);
authRouter.route("/changepassword").put(verifyAccessToken, changePassword);
authRouter.route("/refreshToken").post(handleRefreshToken);
authRouter.route("/google").post(googleSignInController);

export default authRouter;
