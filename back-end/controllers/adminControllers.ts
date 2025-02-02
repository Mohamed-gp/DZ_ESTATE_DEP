import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";

/**
 * @description Get all users
 * @route GET /api/admin/users
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    return res.status(200).json({ message: "Users fetched successfully", data: users.rows });
  } catch (error) {
    next(error);
  }
};



/**
 * @description Remove a user
 * @route DELETE /api/admin/users/:id
 */
const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsers,
  removeUser,
};