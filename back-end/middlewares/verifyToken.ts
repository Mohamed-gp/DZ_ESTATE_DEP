import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import stripe from "../utils/stripe";

const verifyAccessToken = (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  console.log(accessToken);
  if (!accessToken)
    return res.status(401).json({ message: "User not authenticated" });
  const { ACCESS_TOKEN_SECRET } = process.env;
  if (!ACCESS_TOKEN_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }
  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json("Token is not valid");
    } else {
      console.log(decoded.id);
      req.user = { id: decoded.id };
      console.log(req.user);
      next();
    }
  });
};

const verifyUser = (req: authRequest, res: Response, next: NextFunction) => {
  verifyAccessToken(req, res, () => {
    if (req.user.id !== req.params.userId)
      return res.status(403).json({ message: "Forbidden" });
    next();
  });
};

const verifyAdmin = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  verifyAccessToken(req, res, async () => {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (user.rows[0].role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    next();
  });
};
const verifyAdminOrUser = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  verifyAccessToken(req, res, async () => {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (
      user.rows[0].role === "admin" ||
      user.rows[0].id === req.params.userId
    ) {
      next();
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  });
};

const upgradeToPremium = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.user.id;

  try {
    // Create a Stripe Checkout Session for the subscription upgrade
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            unit_amount: 1000, // Example amount in cents ($10.00)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}`,
      cancel_url: `${process.env.CLIENT_URL}`,
      metadata: {
        user_id: user_id,
      },
    });

    return res.status(201).json({
      url: session.url,
      message: "Subscription session created successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing the request" });
  }
};

export {
  verifyAccessToken,
  verifyUser,
  verifyAdmin,
  verifyAdminOrUser,
  upgradeToPremium,
};
