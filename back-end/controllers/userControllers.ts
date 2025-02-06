import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import Stripe from "stripe";

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
) => {
  try {
    let { page = "1", limit = "7", searchText = "" } = req.query;
    const { userId } = req.params; //
    console.log(userId);
    console.log({ page, limit });

    // Initialisation de la requête
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
    let queryValues: any[] = [userId]; // Ajouter l'ID de l'utilisateur pour la clause WHERE
    let index = 2;

    // Recherche textuelle
    if (searchText) {
      query += ` AND (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
      queryValues.push(`%${searchText}%`);
      index++;
    }

    // Regrouper par ID des propriétés
    query += ` GROUP BY properties.id`;

    // Pagination
    if (page && limit) {
      const startIndex = (+page - 1) * +limit;
      query += ` LIMIT $${index} OFFSET $${index + 1}`;
      queryValues.push(+limit, startIndex);
    }

    // Exécution de la requête
    const userProperties = await pool.query(query, queryValues);

    // Vérification des résultats
    if (!userProperties.rows.length) {
      return res.json({ message: "Aucune propriété trouvée.", data: null });
    }

    // Retour des données
    return res.json({
      data: userProperties.rows,
      message: "Properties Fetched Successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getUserPropertiesWishlist = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = "1", limit = "7", searchText = "" } = req.query;
    const { id } = req.user;
    console.log("test");

    // Initialisation de la requête
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
    let queryValues: any[] = [id]; // Ajouter l'ID de l'utilisateur pour la clause WHERE
    let index = 2;

    // Recherche textuelle
    if (searchText) {
      query += ` AND (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
      queryValues.push(`%${searchText}%`);
      index++;
    }

    // Regrouper par ID des propriétés
    query += ` GROUP BY properties.id`;

    // Pagination
    if (page && limit) {
      const startIndex = (+page - 1) * +limit;
      query += ` LIMIT $${index} OFFSET $${index + 1}`;
      queryValues.push(+limit, startIndex);
    }

    // Exécution de la requête
    const wishlistProperties = await pool.query(query, queryValues);

    // Vérification des résultats
    if (!wishlistProperties.rows.length) {
      return res.json({
        message: "Aucune propriété trouvée dans la wishlist.",
        data: null,
      });
    }

    // Retour des données
    return res.json({
      data: wishlistProperties.rows,
      message: "Wishlist Fetched Successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const togglePropertyInWishlist = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.params; // ID of the property
    const userId = req.user.id; // ID of the user (extracted from authentication)

    // Check if the property is already in the wishlist
    const existingWishlistEntry = await pool.query(
      `SELECT * FROM wishlists WHERE user_id = $1 AND property_id = $2`,
      [userId, propertyId]
    );

    if (existingWishlistEntry.rows.length > 0) {
      // The property is already in the wishlist, remove it
      await pool.query(
        `DELETE FROM wishlists WHERE user_id = $1 AND property_id = $2`,
        [userId, propertyId]
      );
    } else {
      // The property is not in the wishlist, add it
      await pool.query(
        `INSERT INTO wishlists (user_id, property_id) VALUES ($1, $2)`,
        [userId, propertyId]
      );
    }

    // Fetch the updated wishlist
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
    next(error); // Handle errors
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

const upgradeUserProfile = async (
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
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
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
  getUserInfo,
  createUser,
  updateUser,
  deleteUser,
  getUserProperties,
  getUserPropertiesWishlist,
  togglePropertyInWishlist,
  upgradeUserProfile,
};
