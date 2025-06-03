import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import stripe from "../utils/stripe";

const getUserInfo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (user.rows.length === 0) {
    return res.status(404).send("User not found");
  }
  user.rows[0].password = null;

  return res
    .status(200)
    .json({ data: user.rows[0], message: "User Info fetched successfully" });
};

const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const newUser = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );
  newUser.rows[0].password = null;

  return res
    .status(201)
    .json({ data: newUser.rows[0], message: "User created successfully" });
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const updatedUser = await pool.query(
    "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
    [name, email, password, id]
  );
  if (updatedUser.rows.length === 0) {
    return res.status(404).send("User not found");
  }
  updatedUser.rows[0].password = null;

  return res
    .status(200)
    .json({ data: updatedUser.rows[0], message: "User updated successfully" });
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedUser = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  if (deletedUser.rows.length === 0) {
    return res.status(404).send("User not found");
  }

  return res.status(200).json({ message: "User deleted successfully" });
};

const getUserProperties = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    let { page = "1", limit = "7", searchText = "" } = req.query;
    const { userId } = req.params;

    let query = `
        SELECT 
          properties.*,
          COALESCE(
            json_agg(
              json_build_object('type', property_assets.type, 'url', property_assets.asset_url)
            ) FILTER (WHERE property_assets.id IS NOT NULL),
            '[]'
          ) AS assets
        FROM properties
        LEFT JOIN property_assets ON properties.id = property_assets.property_id
        WHERE properties.owner_id = $1
      `;
    let queryValues: any[] = [userId];
    let index = 2;

    if (searchText) {
      query += ` AND (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
      queryValues.push(`%${searchText}%`);
      index++;
    }

    query += ` GROUP BY properties.id`;

    if (page && limit) {
      const startIndex = (+page - 1) * +limit;
      query += ` LIMIT $${index} OFFSET $${index + 1}`;
      queryValues.push(+limit, startIndex);
    }

    const userProperties = await pool.query(query, queryValues);

    return res.json({
      data: userProperties.rows,
      message: "Properties Fetched Successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

const getUserPropertiesWishlist = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let { page = "1", limit = "7", searchText = "" } = req.query;

    let query = `
        SELECT 
          properties.*,
          COALESCE(
            json_agg(
              json_build_object('type', property_assets.type, 'url', property_assets.asset_url)
            ) FILTER (WHERE property_assets.id IS NOT NULL),
            '[]'
          ) AS assets
        FROM wishlists
        INNER JOIN properties ON wishlists.property_id = properties.id
        LEFT JOIN property_assets ON properties.id = property_assets.property_id
        WHERE wishlists.user_id = $1
      `;
    let queryValues: any[] = [req.user.id];
    let index = 2;

    if (searchText) {
      query += ` AND (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
      queryValues.push(`%${searchText}%`);
      index++;
    }

    query += ` GROUP BY properties.id`;

    if (page && limit) {
      const startIndex = (+page - 1) * +limit;
      query += ` LIMIT $${index} OFFSET $${index + 1}`;
      queryValues.push(+limit, startIndex);
    }

    const wishlistProperties = await pool.query(query, queryValues);

    return res.json({
      data: wishlistProperties.rows,
      message: "Wishlist Fetched Successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

const togglePropertyInWishlist = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { propertyId } = req.params;
    const userId = req.user.id;

    const existingWishlistEntry = await pool.query(
      `SELECT * FROM wishlists WHERE user_id = $1 AND property_id = $2`,
      [userId, propertyId]
    );

    if (existingWishlistEntry.rows.length > 0) {
      await pool.query(
        `DELETE FROM wishlists WHERE user_id = $1 AND property_id = $2`,
        [userId, propertyId]
      );
    } else {
      await pool.query(
        `INSERT INTO wishlists (user_id, property_id) VALUES ($1, $2)`,
        [userId, propertyId]
      );
    }

    const updatedWishlist = await pool.query(
      `SELECT properties.* FROM properties
         JOIN wishlists ON properties.id = wishlists.property_id
         WHERE wishlists.user_id = $1`,
      [userId]
    );

    return res.json({
      message:
        existingWishlistEntry.rows.length > 0
          ? "Property removed from wishlist."
          : "Property added to wishlist.",
      wishlist: updatedWishlist.rows,
    });
  } catch (error) {
    return next(error);
  }
};

const upgradeUserProfile = async (
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
            unit_amount: 1000, // $10.00 in cents
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
    console.error("Error in upgradeUserProfile:", error);
    return res.status(500).json({
      message: "An error occurred while processing the request",
    });
  }
};

export {
  getUserInfo,
  createUser,
  updateUser,
  deleteUser,
  getUserProperties,
  getUserPropertiesWishlist,
  togglePropertyInWishlist,
  upgradeUserProfile,
};
