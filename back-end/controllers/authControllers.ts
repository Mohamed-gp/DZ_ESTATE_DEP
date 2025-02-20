import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import pool from "../config/connectDb";
import jwt from "jsonwebtoken";
import { encrypt } from "../utils/encryption";
import { decrypt } from "../utils/encryption";
import { authRequest } from "../interfaces/authInterface";

/**
 *
 * @method POST
 * @access Public
 * @description create Access token
 * @route /api/auth/refreshToken
 */
const handleRefreshToken = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No token provided" });
  }
  const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = process.env;

  if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
    console.error("Missing token secrets in environment variables");
    res.status(500).json({ error: "Internal Server error" });
  }
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE refresh_token = $1",
      [encrypt(refreshToken)]
    );
    if (user.rowCount === 0) {
      return res
        .status(200)
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json({ message: "Invalid token login again", data: null });
    }
    // here am decrypting the token and verifying it i encrypt it to store it in the database
    jwt.verify(
      decrypt(refreshToken),
      REFRESH_TOKEN_SECRET,
      (err, decoded: any) => {
        if (err || user.rows[0]?.id !== decoded?.id) {
          return res
            .status(200)
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .json({ message: "Invalid token login again", data: null });
        }
        const accessToken = jwt.sign({ id: decoded.id }, ACCESS_TOKEN_SECRET, {
          expiresIn: "24h",
        });
        return res
          .status(200)
          .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "lax",
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.FRONT_DOMAIN
                : "localhost",
          })
          .json({ message: "access token Created successfully", data: null });
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description Local registration controller
 * @route /api/auth/register
 */
const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, phoneNumber, email, password } = req.body;
  if (!username || !phoneNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const checkUserExistence = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkUserExistence.rowCount > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (username, phone_number , email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, phoneNumber, email, hashedPassword]
    );
    const accessToken = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    const refreshToken = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const encryptedRefreshToken = encrypt(refreshToken);
    await pool.query(`UPDATE users SET "refresh_token" = $1 WHERE id = $2`, [
      encryptedRefreshToken,
      newUser.rows[0].id,
    ]);
    newUser.rows[0].password = null;
    return res
      .status(201)
      .cookie("refreshToken", encryptedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.FRONT_DOMAIN
            : "localhost",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.FRONT_DOMAIN
            : "localhost",
      })
      .json({ message: "Login successful", data: { user: newUser.rows[0] } });
  } catch (err) {
    console.log("error in the register controller");
    console.log(err.message);
    next(err);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description Local login controller
 * @route /api/auth/google
 */
const googleSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, photoUrl } = req.body;
  try {
    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rowCount > 0) {
      const user = userResult.rows[0];

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      const encryptedRefreshToken = encrypt(refreshToken);

      // Store the refresh token in the users table
      await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
        encryptedRefreshToken,
        user.id,
      ]);

      user.password = "";
      return res
        .cookie("refreshToken", encryptedRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "lax",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.FRONT_DOMAIN
              : "localhost",
        })
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "lax",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.FRONT_DOMAIN
              : "localhost",
        })
        .status(200)
        .json({ message: "login successfully", data: user });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const newUserResult = await pool.query(
        "INSERT INTO users (username, email, password, provider, profile_image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [username, email, hashedPassword, "google", photoUrl]
      );

      const newUser = newUserResult.rows[0];
      const accessToken = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "24h",
        }
      );
      const refreshToken = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
          expiresIn: "7d",
        }
      );
      const encryptedRefreshToken = encrypt(refreshToken);

      // Store the refresh token in the users table
      await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
        encryptedRefreshToken,
        newUser.id,
      ]);

      newUser.password = "";
      return res
        .cookie("refreshToken", encryptedRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "lax",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.FRONT_DOMAIN
              : "localhost",
        })
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "lax",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.FRONT_DOMAIN
              : "localhost",
        })
        .status(201)
        .json({ message: "user created successfully", data: newUser });
    }
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description Local login controller
 * @route /api/auth/login
 */
const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const encryptedRefreshToken = encrypt(refreshToken);
    // we store the refresh token in the database so we will be able to revoke it later (logout) by making it invalid
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      encryptedRefreshToken,
      user.rows[0].id,
    ]);
    user.rows[0].password = null;
    return res
      .status(200)
      .cookie("refreshToken", encryptedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.FRONT_DOMAIN
            : "localhost",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.FRONT_DOMAIN
            : "localhost",
      })
      .json({ message: "Login successful", data: { user: user.rows[0] } });
  } catch (error) {
    next(error);
  }
};

// /**
//  *
//  * @method GET
//  * @access Public
//  * @description Google sign-in controller
//  * @route /api/auth/google
//  */
// const googleSignInController = (req: Request, res: Response, next: NextFunction) => {
//   passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
// };

// /**
//  *
//  * @method GET
//  * @access Public
//  * @description Google sign-in callback controller
//  * @route /api/auth/google/callback
//  */
// const googleSignInCallbackController = (req: Request, res: Response, next: NextFunction) => {

// };

/**
 *
 * @method POST
 * @access Public
 * @description Forget password controller
 * @route /api/auth/forget-password
 */
const forgetPasswordController = async (req: Request, res: Response) => {
  // Implement forget password logic here
};

/**
 *
 * @method GET
 * @access Public
 * @description Logout controller
 * @route /api/auth/logout
 */
const logoutController = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // const userId = req.user?.id;
    // if(!userId) {
    //   return res.status(401).json({message: "Unauthorized"});
    // }
    // await pool.query("UPDATE users SET refresh_token = null WHERE id = $1", [userId]);
    return res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV == "development" ? false : true,
        domain:
          process.env.NODE_ENV == "development"
            ? "localhost"
            : "production-server.tech",
      })
      .clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV == "development" ? false : true,
        domain:
          process.env.NODE_ENV == "development"
            ? "localhost"
            : "production-server.tech",
      })
      .clearCookie("accessToken")
      .json({ message: "Logout successful", data: null });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description SMS verification controller
 * @route /api/auth/sms-verification
 */
const smsVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber } = req.body;
  try {
  } catch (err) {
    next(err);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description Verify SMS code controller
 * @route /api/auth/verify-sms-code
 */
const verifySmsCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber, code } = req.body;
  try {
  } catch (err) {
    next(err);
  }
};

/**
 *
 * @method POST
 * @access Public
 * @description change password controller
 * @route /api/auth/changepassword
 */
const changePassword = async (req: authRequest, res: Response) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ data: null, message: "All Fields Are Required" });
  }
  if (confirmNewPassword != newPassword) {
    return res.status(400).json({
      message: "confirmNewPassword and newPassword must be have the same value",
      data: null,
    });
  }

  const user = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.user.id,
  ]);
  console.log(currentPassword, user?.rows[0]?.password);
  const validPassword = await bcrypt.compare(
    currentPassword,
    user?.rows[0]?.password
  );
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ data: null, message: "password must be at least 6 characters" });
  }
  // const { error } = verifyUpdatePassword({ password: newPassword });
  // if (error) {
  //   return res
  //     .status(400)
  //     .json({ data: null, message: error.details[0].message });
  // }

  const updatedUser = await pool.query(
    "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
    [await bcrypt.hash(newPassword, 10), req.user.id]
  );

  updatedUser.rows[0].password = "";
  res
    .status(200)
    .json({ message: "updated successfully", data: updatedUser.rows[0] });
};

export {
  handleRefreshToken,
  loginController,
  registerController,
  googleSignInController,
  // googleSignInCallbackController,
  forgetPasswordController,
  logoutController,
  smsVerificationController,
  changePassword,
  verifySmsCodeController,
};
