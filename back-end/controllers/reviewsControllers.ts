import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";

// Add a Review
const addReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const { property_id, rating, comment } = req.body;

  const user_id = req.user.id; // Assuming you have user authentication middleware

  try {
    const result = await pool.query(
      `INSERT INTO reviews (property_id, user_id, rating, comment, created_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [property_id, user_id, rating, comment]
    );

    return res.status(201).json({
      data: result.rows[0],
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding the review" });
  }
};

// Get Reviews for a Property
const getReviewsForProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  console.log(id, "test");
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
    console.error("Error fetching reviews:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the reviews" });
  }
};

// Update a Review
const updateReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const user_id = req.user.id; // Assuming you have user authentication middleware

  try {
    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND user_id = $4 
       RETURNING *`,
      [rating, comment, id, user_id]
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
    console.error("Error updating review:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the review" });
  }
};

// Delete a Review
const deleteReview = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  console.log(id, "test");
  const user_id = req.user.id; // Assuming you have user authentication middleware

  try {
    const result = await pool.query(
      `DELETE FROM reviews 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, user_id]
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
    console.error("Error deleting review:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the review" });
  }
};

export { addReview, getReviewsForProperty, updateReview, deleteReview };
