
import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";






const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsersQuery = await pool.query("SELECT COUNT(*) FROM users");
    const totalPropertiesQuery = await pool.query("SELECT COUNT(*) FROM properties");
    const totalSalesQuery = await pool.query("SELECT COUNT(*) FROM orders WHERE order_type = 'purchase'");
    const totalRevenueQuery = await pool.query("SELECT SUM(amount) FROM orders WHERE order_type = 'purchase'");
    const newUsersThisMonthQuery = await pool.query(
      "SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', current_date)"
    );
    const newPropertiesThisMonthQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE created_at >= date_trunc('month', current_date)"
    );

    const totalUsers = totalUsersQuery.rows[0].count;
    const totalProperties = totalPropertiesQuery.rows[0].count;
    const totalSales = totalSalesQuery.rows[0].count;
    const totalRevenue = totalRevenueQuery.rows[0].sum || 0;
    const newUsersThisMonth = newUsersThisMonthQuery.rows[0].count;
    const newPropertiesThisMonth = newPropertiesThisMonthQuery.rows[0].count;

    return res.status(200).json({
      data: {
        totalUsers,
        totalProperties,
        totalSales,
        totalRevenue,
        newUsersThisMonth,
        newPropertiesThisMonth,
      },
      message: "Analytics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ message: "An error occurred while fetching analytics" });
  }
};



export {
  getAnalytics,
};