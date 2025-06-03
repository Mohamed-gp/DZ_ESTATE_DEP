import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";

/**
 * @description Get all users
 * @route GET /api/admin/users
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    return res
      .status(200)
      .json({ message: "Users fetched successfully", data: users.rows });
  } catch (error) {
    return next(error);
  }
};

const getAllProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = "1", limit = "7", searchText = "" } = req.query;

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
      `;
    let queryValues: any[] = [];
    let index = 1;

    // Recherche textuelle
    if (searchText) {
      query += ` WHERE (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
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
    const properties = await pool.query(query, queryValues);

    // Vérification des résultats
    if (!properties.rows.length) {
      return res.json({ message: "Aucune propriété trouvée.", data: null });
    }

    // Retour des données
    return res.json({
      data: properties.rows,
      message: "Properties fetched successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const removeProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM properties WHERE id = $1", [id]);
    return res.status(200).json({ message: "Property removed successfully" });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description Remove a user
 * @route DELETE /api/admin/users/:id
 */
const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    return next(error);
  }
};

export { getAllUsers, removeUser, getAllProperties, removeProperty };
