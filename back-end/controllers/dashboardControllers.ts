import { Request, Response } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";

// Dashboard Overview Stats
const getDashboardStats = async (req: authRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Get basic stats
    const statsQuery = isAdmin
      ? `
      SELECT 
        (SELECT COUNT(*) FROM properties) as total_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'available') as available_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'rented') as rented_properties,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM reservations) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'paid') as confirmed_reservations,
        (SELECT COALESCE(SUM(amount), 0) FROM reservations WHERE status = 'paid') as total_revenue,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews) as average_rating
    `
      : `
      SELECT 
        (SELECT COUNT(*) FROM properties WHERE owner_id = $1) as my_properties,
        (SELECT COUNT(*) FROM properties WHERE owner_id = $1 AND status = 'available') as available_properties,
        (SELECT COUNT(*) FROM properties WHERE owner_id = $1 AND status = 'rented') as rented_properties,
        (SELECT COUNT(*) FROM reservations r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1) as total_bookings,
        (SELECT COUNT(*) FROM reservations r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1 AND r.status = 'paid') as confirmed_bookings,
        (SELECT COALESCE(SUM(r.amount), 0) FROM reservations r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1 AND r.status = 'paid') as total_earnings,
        (SELECT COUNT(*) FROM reviews r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1) as total_reviews,
        (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1) as average_rating
    `;

    const statsValues = isAdmin ? [] : [userId];
    const stats = await pool.query(statsQuery, statsValues);

    // Get recent activities
    const recentActivitiesQuery = isAdmin
      ? `
      SELECT 
        'property' as type,
        p.title as title,
        p.created_at as date,
        u.username as user
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `
      : `
      SELECT 
        'booking' as type,
        p.title as title,
        r.created_at as date,
        u.username as user
      FROM reservations r
      JOIN properties p ON r.property_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE p.owner_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const activitiesValues = isAdmin ? [] : [userId];
    const activities = await pool.query(
      recentActivitiesQuery,
      activitiesValues
    );

    // Get revenue/earnings data for the last 6 months
    const revenueQuery = isAdmin
      ? `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM reservations 
      WHERE status = 'paid' 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `
      : `
      SELECT 
        DATE_TRUNC('month', r.created_at) as month,
        COALESCE(SUM(r.amount), 0) as earnings
      FROM reservations r
      JOIN properties p ON r.property_id = p.id
      WHERE p.owner_id = $1 
        AND r.status = 'paid'
        AND r.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', r.created_at)
      ORDER BY month
    `;

    const revenueValues = isAdmin ? [] : [userId];
    const revenue = await pool.query(revenueQuery, revenueValues);

    return res.json({
      data: {
        stats: stats.rows[0],
        recentActivities: activities.rows,
        revenueData: revenue.rows,
      },
      message: "Dashboard stats fetched successfully",
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({
      message: "An error occurred while fetching dashboard stats",
    });
  }
};

// Property Performance Analytics
const getPropertyAnalytics = async (req: authRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    // Verify property ownership
    const propertyCheck = await pool.query(
      "SELECT id FROM properties WHERE id = $1 AND owner_id = $2",
      [propertyId, userId]
    );

    if (!propertyCheck.rows.length) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    // Get property performance metrics
    const analyticsQuery = `
      SELECT 
        p.title,
        p.price,
        p.status,
        p.created_at,
        COUNT(DISTINCT r.id) as total_bookings,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'paid') as confirmed_bookings,
        COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'paid'), 0) as total_revenue,
        COUNT(DISTINCT rv.id) as total_reviews,
        COALESCE(AVG(rv.rating), 0) as average_rating,
        COUNT(DISTINCT pv.user_id) as total_views
      FROM properties p
      LEFT JOIN reservations r ON p.id = r.property_id
      LEFT JOIN reviews rv ON p.id = rv.property_id
      LEFT JOIN property_views pv ON p.id = pv.property_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const analytics = await pool.query(analyticsQuery, [propertyId]);

    // Get monthly booking trends
    const monthlyTrends = await pool.query(
      `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as bookings,
        COALESCE(SUM(amount), 0) as revenue
      FROM reservations
      WHERE property_id = $1 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `,
      [propertyId]
    );

    // Get recent reviews
    const recentReviews = await pool.query(
      `
      SELECT 
        r.rating,
        r.comment,
        r.created_at,
        u.username,
        u.profile_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.property_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `,
      [propertyId]
    );

    return res.json({
      data: {
        analytics: analytics.rows[0],
        monthlyTrends: monthlyTrends.rows,
        recentReviews: recentReviews.rows,
      },
      message: "Property analytics fetched successfully",
    });
  } catch (error) {
    console.error("Error in getPropertyAnalytics:", error);
    return res.status(500).json({
      message: "An error occurred while fetching property analytics",
    });
  }
};

// User Management (Admin only)
const getUserManagement = async (req: authRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { page = 1, limit = 10, search, status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.role,
        u.is_active,
        u.created_at,
        u.profile_image,
        COUNT(DISTINCT p.id) as properties_count,
        COUNT(DISTINCT r.id) as bookings_count,
        COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'paid'), 0) as total_spent
      FROM users u
      LEFT JOIN properties p ON u.id = p.owner_id
      LEFT JOIN reservations r ON u.id = r.user_id
      WHERE 1=1
    `;

    const queryValues: any[] = [];
    let valueIndex = 1;

    if (search) {
      query += ` AND (u.username ILIKE $${valueIndex} OR u.email ILIKE $${valueIndex})`;
      queryValues.push(`%${search}%`);
      valueIndex++;
    }

    if (status) {
      query += ` AND u.is_active = $${valueIndex}`;
      queryValues.push(status === "active");
      valueIndex++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    queryValues.push(limitNum, offset);

    const users = await pool.query(query, queryValues);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM users WHERE 1=1";
    const countValues = queryValues.slice(0, -2);

    if (search) {
      countQuery += " AND (username ILIKE $1 OR email ILIKE $1)";
    }
    if (status) {
      countQuery += ` AND is_active = $${search ? 2 : 1}`;
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      data: users.rows,
      pagination: {
        total: totalCount,
        pages: totalPages,
        page: pageNum,
        limit: limitNum,
      },
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error in getUserManagement:", error);
    return res.status(500).json({
      message: "An error occurred while fetching users",
    });
  }
};

// Toggle user status (Admin only)
const toggleUserStatus = async (req: authRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, username, is_active",
      [isActive, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      data: result.rows[0],
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
    return res.status(500).json({
      message: "An error occurred while updating user status",
    });
  }
};

// System Analytics (Admin only)
const getSystemAnalytics = async (req: authRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Get platform metrics
    const platformMetrics = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
        (SELECT COUNT(*) FROM properties WHERE created_at >= NOW() - INTERVAL '30 days') as new_properties_month,
        (SELECT COUNT(*) FROM reservations WHERE created_at >= NOW() - INTERVAL '30 days') as new_bookings_month,
        (SELECT COALESCE(SUM(amount), 0) FROM reservations WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days') as revenue_month,
        (SELECT COUNT(*) FROM properties WHERE status = 'available') as available_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'rented') as rented_properties,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE created_at >= NOW() - INTERVAL '30 days') as avg_rating_month
    `);

    // Get category distribution
    const categoryStats = await pool.query(`
      SELECT 
        c.name as category,
        COUNT(p.id) as property_count,
        COALESCE(AVG(p.price), 0) as avg_price
      FROM categories c
      LEFT JOIN properties p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY property_count DESC
    `);

    // Get location statistics
    const locationStats = await pool.query(`
      SELECT 
        wilaya,
        COUNT(*) as property_count,
        COALESCE(AVG(price), 0) as avg_price
      FROM properties
      GROUP BY wilaya
      ORDER BY property_count DESC
      LIMIT 10
    `);

    // Get user growth over time
    const userGrowth = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    return res.json({
      data: {
        platformMetrics: platformMetrics.rows[0],
        categoryStats: categoryStats.rows,
        locationStats: locationStats.rows,
        userGrowth: userGrowth.rows,
      },
      message: "System analytics fetched successfully",
    });
  } catch (error) {
    console.error("Error in getSystemAnalytics:", error);
    return res.status(500).json({
      message: "An error occurred while fetching system analytics",
    });
  }
};

export {
  getDashboardStats,
  getPropertyAnalytics,
  getUserManagement,
  toggleUserStatus,
  getSystemAnalytics,
};
