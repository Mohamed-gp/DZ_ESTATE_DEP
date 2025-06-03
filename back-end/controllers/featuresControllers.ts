import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";

/**
 * @description Get all features
 * @route GET /api/features
 */
const getFeatures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const features = await pool.query("SELECT * FROM features");
    return res
      .status(200)
      .json({ message: "Features fetched successfully", data: features.rows });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @description Add a new feature
 * @route POST /api/features
 */
const addFeature = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;
  try {
    const newFeature = await pool.query(
      "INSERT INTO features (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    return res
      .status(201)
      .json({
        message: "Feature added successfully",
        data: newFeature.rows[0],
      });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * @description Remove a feature
 * @route DELETE /api/features/:id
 */
const removeFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM features WHERE id = $1", [id]);
    return res.status(200).json({ message: "Feature removed successfully" });
  } catch (error) {
    next(error);
    return;
  }
};

export { getFeatures, addFeature, removeFeature };
