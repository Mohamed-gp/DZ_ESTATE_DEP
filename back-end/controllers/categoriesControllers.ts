import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import pool from "../config/connectDb";
import jwt from "jsonwebtoken";
import { encrypt } from "../utils/encryption";
import { decrypt } from '../utils/encryption';
import { authRequest } from "../interfaces/authInterface";


/**
 * 
 * @method GET 
 * @access Public
 * @description create Access token
 * @route /api/categories
 */
const getCategories = async (req: Request, res: Response,next : NextFunction) => {
    try {
        const categories = await pool.query('SELECT * FROM categories');
        return res.status(200).json({ message: "categories fetched successfully", data: categories.rows });
    } catch (error) {
      next(error);
    }
};



export {
  getCategories,

};