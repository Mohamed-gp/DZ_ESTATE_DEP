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
    
    return res.status(200).json({ data: user.rows[0], message: "User Info fetched successfully" });
};

const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
    );
    newUser.rows[0].password = null;

    return res.status(201).json({ data: newUser.rows[0], message: "User created successfully" });
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

    return res.status(200).json({ data: updatedUser.rows[0], message: "User updated successfully" });
};

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedUser = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (deletedUser.rows.length === 0) {
        return res.status(404).send("User not found");
    }

    return res.status(200).json({ message: "User deleted successfully" });
};

const getUserProperties = async (req: authRequest, res: Response,next : NextFunction) => {
    try {
      let { page = '1', limit = '7', searchText = '' } = req.query;
      const {userId} = req.params; // 
      console.log(userId)
      console.log({ page, limit,})
  
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
        next(error)
     }
  };

  const getUserPropertiesWishlist = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
      let { page = '1', limit = '7', searchText = '' } = req.query;
      const {id}= req.user;
  
  
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
        return res.json({ message: "Aucune propriété trouvée dans la wishlist.", data: null });
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

  const togglePropertyInWishlist = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
      const { propertyId } = req.params; // ID de la propriété
      const userId= req.user.id; // ID de l'utilisateur (extrait de l'authentification)
  
      // Vérifier si la propriété est déjà dans la wishlist
      const existingWishlistEntry = await pool.query(
        `SELECT * FROM wishlists WHERE user_id = $1 AND property_id = $2`,
        [userId, propertyId]
      );
  
      if (existingWishlistEntry.rows.length > 0) {
        // La propriété est déjà dans la wishlist, la supprimer
        await pool.query(
          `DELETE FROM wishlists WHERE user_id = $1 AND property_id = $2`,
          [userId, propertyId]
        );
        return res.json({
          message: "Propriété retirée de la wishlist.",
        });
      } else {
        // La propriété n'est pas dans la wishlist, l'ajouter
        await pool.query(
          `INSERT INTO wishlists (user_id, property_id) VALUES ($1, $2)`,
          [userId, propertyId]
        );
        return res.json({
          message: "Propriété ajoutée à la wishlist.",
        });
      }
    } catch (error) {
      next(error); // Gérer les erreurs
    }
  };
  


  
  const upgradeUserProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentMethodId } = req.body;
  
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // Amount in cents (e.g., $10.00)
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
      });
  
      if (paymentIntent.status === "succeeded") {
        // Mark all properties of the user as sponsored
        await pool.query(
          "UPDATE properties SET is_sponsored = true WHERE owner_id = $1",
          [id]
        );
  
        return res.status(200).json({ message: "Subscription successful and properties sponsored" });
      } else {
        return res.status(400).json({ message: "Payment failed" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server error");
    }
  };
  
export { getUserInfo, createUser, updateUser, deleteUser,getUserProperties,getUserPropertiesWishlist ,togglePropertyInWishlist,upgradeUserProfile};