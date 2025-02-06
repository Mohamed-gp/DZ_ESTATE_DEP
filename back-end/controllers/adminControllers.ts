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
    next(error);
  }
};

const getAllProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const properties = await pool.query("SELECT * FROM properties");
    return res.status(200).json({
      message: "Properties fetched successfully",
      data: properties.rows,
    });
  } catch (error) {
    next(error);
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
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, removeUser, getAllProperties, removeProperty };
