import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";

/**
 * @description Get all categories
 * @route GET /api/categories
 */
const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await pool.query('SELECT * FROM categories');
    return res.status(200).json({ message: "Categories fetched successfully", data: categories.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Add a new category
 * @route POST /api/categories
 */
const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;
  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return res.status(201).json({ message: "Category added successfully", data: newCategory.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Remove a category
 * @route DELETE /api/categories/:id
 */
const removeCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  getCategories,
  addCategory,
  removeCategory,
};