import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";

const addReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { property_id, rating, comment } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO reviews (property_id, user_id, rating, comment, created_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [property_id, req.user.id, rating, comment]
    );

    return res.status(201).json({
      data: result.rows[0],
      message: "Review added successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const getReviewsForProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT reviews.*, users.username, users.profile_image 
       FROM reviews 
       LEFT JOIN users ON reviews.user_id = users.id 
       WHERE reviews.property_id = $1`,
      [id]
    );

    return res.status(200).json({
      data: result.rows,
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const updateReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND user_id = $4 
       RETURNING *`,
      [rating, comment, id, req.user.id]
    );

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ message: "Review not found or not authorized" });
    }

    return res.status(200).json({
      data: result.rows[0],
      message: "Review updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const deleteReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM reviews 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ message: "Review not found or not authorized" });
    }

    return res.status(200).json({
      data: result.rows[0],
      message: "Review deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export { addReview, getReviewsForProperty, updateReview, deleteReview };
