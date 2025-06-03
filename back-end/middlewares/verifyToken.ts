import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import stripe from "../utils/stripe";

interface JwtPayload {
  id: string;
  role?: string;
}

const verifyAccessToken = (
  req: authRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const accessToken = req.cookies.accessToken;
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token required" });
  }
  if (!ACCESS_TOKEN_SECRET) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  jwt.verify(
    accessToken,
    ACCESS_TOKEN_SECRET,
    (err: Error | null, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = decoded as JwtPayload;
      return next();
    }
  );
};

const verifyUser = (
  req: authRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  verifyAccessToken(req, res, () => {
    if (!req.user || req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  });
};

const verifyAdmin = (
  req: authRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  verifyAccessToken(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    return next();
  });
};

const verifyAdminOrUser = (
  req: authRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  verifyAccessToken(req, res, () => {
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.id !== req.params.userId)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  });
};

const upgradeToPremium = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
      metadata: {
        user_id: req.user.id,
      },
    });

    return res.status(201).json({
      url: session.url,
      message: "Subscription session created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while processing the request",
    });
  }
};

export {
  verifyAccessToken,
  verifyUser,
  verifyAdmin,
  verifyAdminOrUser,
  upgradeToPremium,
};
