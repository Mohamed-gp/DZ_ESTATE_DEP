import { Request, Response, NextFunction } from "express";
import pool from "../config/connectDb";
import { authRequest } from "../interfaces/authInterface";
import logger from "../utils/logger";
import cache from "../utils/cache";

// Get comprehensive dashboard analytics
const getDashboardAnalytics = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { timeframe = "30" } = req.query; // days
    const cacheKey = `dashboard_analytics_${timeframe}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        message: "Analytics data retrieved successfully (cached)",
      });
    }

    // Property statistics
    const propertyStats = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_properties,
        COUNT(CASE WHEN status = 'rented' THEN 1 END) as rented_properties,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_properties,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${timeframe} days' THEN 1 END) as new_properties
      FROM properties
    `);

    // Revenue analytics
    const revenueStats = await pool.query(`
      SELECT 
        SUM(CASE WHEN r.status = 'confirmed' THEN p.price ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as completed_bookings,
        AVG(p.price) as average_property_price,
        COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '${timeframe} days' THEN 1 END) as recent_bookings
      FROM reservations r
      JOIN properties p ON r.property_id = p.id
    `);

    // User analytics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${timeframe} days' THEN 1 END) as new_users,
        COUNT(CASE WHEN role = 'premium' THEN 1 END) as premium_users
      FROM users
    `);

    // Popular locations
    const popularLocations = await pool.query(`
      SELECT 
        commune,
        COUNT(*) as property_count,
        AVG(price) as avg_price
      FROM properties 
      WHERE commune IS NOT NULL
      GROUP BY commune 
      ORDER BY property_count DESC 
      LIMIT 10
    `);

    // Monthly trends
    const monthlyTrends = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as properties_added,
        AVG(price) as avg_price
      FROM properties 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Recent activities
    const recentActivities = await pool.query(`
      (SELECT 'property_added' as type, title as description, created_at, owner_id as user_id 
       FROM properties 
       ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'booking' as type, 'New booking made' as description, created_at, user_id 
       FROM reservations 
       ORDER BY created_at DESC LIMIT 5)
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const analytics = {
      properties: propertyStats.rows[0],
      revenue: revenueStats.rows[0],
      users: userStats.rows[0],
      popularLocations: popularLocations.rows,
      monthlyTrends: monthlyTrends.rows,
      recentActivities: recentActivities.rows,
      timeframe: `${timeframe} days`,
    };

    // Cache the result for 15 minutes
    await cache.set(cacheKey, analytics, 900);

    logger.info(`Analytics data retrieved for timeframe: ${timeframe} days`);

    return res.status(200).json({
      success: true,
      data: analytics,
      message: "Analytics data retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    return next(error);
  }
};

// Get property performance metrics
const getPropertyPerformance = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { property_id } = req.params;
    const cacheKey = `property_performance_${property_id}`;

    // Try cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        message: "Property performance data retrieved successfully (cached)",
      });
    }

    const performance = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.price,
        COALESCE(p.views, 0) as views,
        COUNT(DISTINCT w.user_id) as wishlist_count,
        COUNT(DISTINCT r.id) as booking_count,
        COUNT(DISTINCT rev.id) as review_count,
        AVG(rev.rating) as average_rating,
        SUM(CASE WHEN r.status = 'confirmed' THEN p.price ELSE 0 END) as total_revenue
      FROM properties p
      LEFT JOIN wishlists w ON p.id = w.property_id
      LEFT JOIN reservations r ON p.id = r.property_id
      LEFT JOIN reviews rev ON p.id = rev.property_id
      WHERE p.id = $1
      GROUP BY p.id, p.title, p.price, p.views
    `,
      [property_id]
    );

    if (!performance.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Cache for 30 minutes
    await cache.set(cacheKey, performance.rows[0], 1800);

    return res.status(200).json({
      success: true,
      data: performance.rows[0],
      message: "Property performance data retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching property performance:", error);
    return next(error);
  }
};

// Get user engagement metrics
const getUserEngagement = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const cacheKey = "user_engagement_30days";

    // Try cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        message: "User engagement data retrieved successfully (cached)",
      });
    }

    const engagement = await pool.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_actions
      FROM (
        SELECT user_id, created_at FROM reservations
        UNION ALL
        SELECT user_id, created_at FROM reviews
        UNION ALL
        SELECT user_id, created_at FROM wishlists
      ) activities
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `);

    // Cache for 1 hour
    await cache.set(cacheKey, engagement.rows, 3600);

    return res.status(200).json({
      success: true,
      data: engagement.rows,
      message: "User engagement data retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching user engagement:", error);
    return next(error);
  }
};

// Get top performing properties
const getTopProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { limit = "10", metric = "views" } = req.query;
    const cacheKey = `top_properties_${metric}_${limit}`;

    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        message: "Top properties retrieved successfully (cached)",
      });
    }

    let orderBy = "p.views DESC";
    if (metric === "bookings") {
      orderBy = "booking_count DESC";
    } else if (metric === "revenue") {
      orderBy = "total_revenue DESC";
    } else if (metric === "rating") {
      orderBy = "average_rating DESC";
    }

    const topProperties = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.price,
        p.views,
        p.commune,
        COUNT(DISTINCT r.id) as booking_count,
        COUNT(DISTINCT rev.id) as review_count,
        AVG(rev.rating) as average_rating,
        SUM(CASE WHEN r.status = 'confirmed' THEN p.price ELSE 0 END) as total_revenue,
        (
          SELECT pa.asset_url 
          FROM property_assets pa 
          WHERE pa.property_id = p.id AND pa.type = 'image' 
          LIMIT 1
        ) as featured_image
      FROM properties p
      LEFT JOIN reservations r ON p.id = r.property_id
      LEFT JOIN reviews rev ON p.id = rev.property_id
      WHERE p.status = 'available'
      GROUP BY p.id, p.title, p.price, p.views, p.commune
      ORDER BY ${orderBy}
      LIMIT $1
    `,
      [parseInt(limit as string)]
    );

    // Cache for 2 hours
    await cache.set(cacheKey, topProperties.rows, 7200);

    return res.status(200).json({
      success: true,
      data: topProperties.rows,
      message: "Top properties retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching top properties:", error);
    return next(error);
  }
};

// Get analytics summary for admin dashboard
const getAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const cacheKey = "analytics_summary";

    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        message: "Analytics summary retrieved successfully (cached)",
      });
    }

    // Get key metrics
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) as total_properties,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') as total_bookings,
        (SELECT SUM(p.price) FROM reservations r JOIN properties p ON r.property_id = p.id WHERE r.status = 'confirmed') as total_revenue,
        (SELECT COUNT(*) FROM properties WHERE created_at >= NOW() - INTERVAL '24 hours') as properties_today,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours') as users_today,
        (SELECT COUNT(*) FROM reservations WHERE created_at >= NOW() - INTERVAL '24 hours') as bookings_today
    `);

    // Cache for 30 minutes
    await cache.set(cacheKey, summary.rows[0], 1800);

    return res.status(200).json({
      success: true,
      data: summary.rows[0],
      message: "Analytics summary retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching analytics summary:", error);
    return next(error);
  }
};

export {
  getDashboardAnalytics,
  getPropertyPerformance,
  getUserEngagement,
  getTopProperties,
  getAnalyticsSummary,
};
