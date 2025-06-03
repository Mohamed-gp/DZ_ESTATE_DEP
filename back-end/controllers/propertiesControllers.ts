import multer from "multer";
import cloudinary from "../config/cloudinary";
import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";
import Stripe from "stripe";
import { authRequest } from "../interfaces/authInterface";
import removefiles from "../utils/cleanUpload";
import logger from "../utils/logger";

// Initialize Stripe with error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const addPropertyController = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }

    const {
      title,
      description,
      price,
      status,
      commune,
      quartier,
      wilaya,
      longitude,
      latitude,
      guests,
      bedrooms,
      bathrooms,
      category,
      features,
    } = req.body;

    // Validation
    if (!title || !description || !price || !status) {
      return res.status(400).json({
        message: "Title, description, price, and status are required",
        data: null,
      });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "At least one file is required",
        data: null,
      });
    }

    // Séparer les fichiers images et vidéos selon leur type MIME
    const imageFiles = files.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    const videoFiles = files.filter((file) =>
      file.mimetype.startsWith("video/")
    );

    // Vérifier le nombre minimum de fichiers images
    if (imageFiles.length < 6) {
      return res.status(400).json({
        message: "You must upload at least 6 image files",
        data: null,
      });
    }

    // Uploader les images avec gestion d'erreur
    const uploadedImages = await Promise.all(
      imageFiles.map(async (image) => {
        try {
          return await cloudinary.uploader.upload(image.path, {
            resource_type: "image",
            folder: "properties/images",
            transformation: [
              { width: 1200, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          });
        } catch (error) {
          console.error("Image upload error:", error);
          throw new Error(`Failed to upload image: ${image.filename}`);
        }
      })
    );

    // Uploader les vidéos avec gestion d'erreur
    const uploadedVideos = await Promise.all(
      videoFiles.map(async (video) => {
        try {
          return await cloudinary.uploader.upload(video.path, {
            resource_type: "video",
            folder: "properties/videos",
            transformation: [{ quality: "auto" }],
          });
        } catch (error) {
          console.error("Video upload error:", error);
          throw new Error(`Failed to upload video: ${video.filename}`);
        }
      })
    );

    // Start database transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const createdProperty = await client.query(
        `INSERT INTO properties 
        (title, description, price, status, commune, quartier, wilaya, longitude, latitude, guests, bedrooms, bathrooms, owner_id, category_id, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING *`,
        [
          title,
          description,
          parseFloat(price),
          status,
          commune,
          quartier,
          parseInt(wilaya),
          parseFloat(longitude),
          parseFloat(latitude),
          parseInt(guests),
          parseInt(bedrooms),
          parseInt(bathrooms),
          req.user.id,
          parseInt(category),
        ]
      );

      const propertyId = createdProperty.rows[0].id;

      // Ajouter les URLs des images dans la table `property_assets`
      for (const uploadedImage of uploadedImages) {
        await client.query(
          `INSERT INTO property_assets (property_id, asset_url, type) 
          VALUES ($1, $2, $3) RETURNING *`,
          [propertyId, uploadedImage.secure_url, "image"]
        );
      }

      // Ajouter les URLs des vidéos dans la table `property_assets`
      for (const uploadedVideo of uploadedVideos) {
        await client.query(
          `INSERT INTO property_assets (property_id, asset_url, type) 
          VALUES ($1, $2, $3) RETURNING *`,
          [propertyId, uploadedVideo.secure_url, "video"]
        );
      }

      // Ajouter les features dans la table `property_features`
      if (features && features.length > 0) {
        const featureIds = features.map((featureId: string) =>
          parseInt(featureId, 10)
        );
        for (const featureId of featureIds) {
          await client.query(
            `INSERT INTO property_features (property_id, feature_id) 
            VALUES ($1, $2) RETURNING *`,
            [propertyId, featureId]
          );
        }
      }

      await client.query("COMMIT");
      client.release();

      // Nettoyer les fichiers temporaires
      removefiles();

      return res.status(201).json({
        data: createdProperty.rows[0],
        message:
          "Property added successfully with images, videos, and features",
      });
    } catch (dbError) {
      await client.query("ROLLBACK");
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error("Error in addPropertyController:", error);

    // Clean up uploaded files in case of error
    removefiles();

    return next(error);
  }
};

const getProperties = async (req: Request, res: Response) => {
  let {
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    status,
    keyword,
  } = req.query;

  try {
    // Build queries separately for better performance
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Base conditions array that will be joined with AND
    const conditions = ["1=1"];
    const queryValues: any[] = [];
    let valueIndex = 1;

    // Build WHERE clause dynamically
    if (status) {
      conditions.push(`properties.status = $${valueIndex}`);
      queryValues.push(status);
      valueIndex++;
    }

    // Optimize category filter by caching category lookup
    if (category) {
      try {
        const categoryResult = await pool.query(
          "SELECT id FROM categories WHERE name = $1",
          [category]
        );
        if (categoryResult.rows.length > 0) {
          conditions.push(`properties.category_id = $${valueIndex}`);
          queryValues.push(categoryResult.rows[0].id);
          valueIndex++;
        }
      } catch (err) {
        console.error("Category lookup error:", err);
      }
    }

    if (minPrice) {
      conditions.push(`properties.price >= $${valueIndex}`);
      queryValues.push(+minPrice);
      valueIndex++;
    }

    if (maxPrice) {
      conditions.push(`properties.price <= $${valueIndex}`);
      queryValues.push(+maxPrice);
      valueIndex++;
    }

    // Optimize text search using PostgreSQL's full-text search capabilities
    if (keyword) {
      // Using to_tsquery with proper plainto_tsquery for better search
      conditions.push(`
        (properties.tsv @@ plainto_tsquery('english', $${valueIndex})
         OR properties.title ILIKE $${valueIndex + 1}
         OR properties.description ILIKE $${valueIndex + 1})
      `);
      queryValues.push(keyword);
      queryValues.push(`%${keyword}%`);
      valueIndex += 2;
    }

    // First, get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT properties.id) 
      FROM properties
      WHERE ${conditions.join(" AND ")}
    `;

    const countResult = await pool.query(countQuery, queryValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Main query - optimized to fetch only needed data
    const mainQuery = `
      SELECT 
        properties.id,
        properties.title,
        properties.description,
        properties.price,
        properties.status,
        properties.guests,
        properties.bedrooms,
        properties.bathrooms,
        properties.owner_id,
        properties.category_id,
        properties.created_at,
        properties.updated_at,
        properties.wilaya,
        properties.commune,
        properties.quartier,
        properties.longitude,
        properties.latitude,
        categories.name AS category_name,
        categories.description AS category_description,
        (
          SELECT json_agg(json_build_object('id', pa.id, 'type', pa.type, 'url', pa.asset_url))
          FROM (
            SELECT id, type, asset_url 
            FROM property_assets 
            WHERE property_id = properties.id
            LIMIT 5
          ) pa
        ) AS assets
      FROM properties
      LEFT JOIN categories ON properties.category_id = categories.id
      WHERE ${conditions.join(" AND ")}
      GROUP BY properties.id, categories.id
      ORDER BY properties.created_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;

    queryValues.push(limitNum, offset);

    // Execute main query
    const propertiesResult = await pool.query(mainQuery, queryValues);

    return res.json({
      data: propertiesResult.rows,
      pagination: {
        total: totalCount,
        pages: totalPages,
        page: pageNum,
        limit: limitNum,
      },
      message: "Properties fetched successfully",
    });
  } catch (error) {
    console.error("Error in getProperties:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching properties" });
  }
};

const getProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = `
    SELECT 
      properties.*,
      json_build_object(
        'id', users.id,
        'username', users.username,
        'email', users.email,
        'phone_number', users.phone_number,
        'profile_image', users.profile_image
      ) AS owner,
      COALESCE(
        json_agg(
          json_build_object('type', property_assets.type, 'url', property_assets.asset_url)
        ) FILTER (WHERE property_assets.id IS NOT NULL),
        '[]'
      ) AS assets,
      COALESCE(
        json_agg(
          json_build_object(
            'id', reviews.id,
            'user_id', reviews.user_id,
            'rating', reviews.rating,
            'comment', reviews.comment,
            'created_at', reviews.created_at
          )
        ) FILTER (WHERE reviews.id IS NOT NULL),
        '[]'
      ) AS comments
    FROM properties
    LEFT JOIN users ON properties.owner_id = users.id
    LEFT JOIN property_assets ON properties.id = property_assets.property_id
    LEFT JOIN reviews ON properties.id = reviews.property_id
    WHERE properties.id = $1
    GROUP BY properties.id, users.id
  `;

  try {
    const property = await pool.query(query, [id]);

    if (!property.rows.length) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({
      data: property.rows[0],
      message: "Property fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the property" });
  }
};

const getRecommendedProperties = async (req: Request, res: Response) => {
  const properties = await pool.query(
    "SELECT * FROM properties ORDER BY RANDOM() LIMIT 8"
  );
  if (!properties.rows[0]) {
    return res.json({ message: "No property found", data: null });
  }
  return res.json({
    data: properties.rows,
    message: "Properties fetched successfully",
  });
};

const reserveProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  const property = await pool.query("SELECT * FROM properties WHERE id = $1", [
    id,
  ]);
  if (!property.rows[0]) {
    return res.json({ message: "Property not found" });
  }
  const reservedProperty = await pool.query(
    "INSERT INTO reserved_properties (property_id, user_id) VALUES ($1, $2) RETURNING *",
    [id, userId]
  );
  return res.json({
    data: reservedProperty.rows[0],
    message: "Property reserved successfully",
  });
};

const addReservationWithStripe = async (req: authRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized", data: null });
    }
    const userId = req.user.id;
    const homeId = req.params.id;

    let { checkIn, checkOut } = req.body;
    checkIn = new Date(checkIn);
    checkOut = new Date(checkOut);

    if (checkIn > checkOut) {
      return res.status(400).json({
        data: null,
        message: "Check out date must be greater than check in date",
      });
    }
    if (checkIn < new Date()) {
      return res.status(400).json({
        message: "Check in date must be greater than today",
        data: null,
      });
    }

    const home = await pool.query("SELECT * FROM homes WHERE id = $1", [
      homeId,
    ]);
    if (!home.rows[0]) {
      return res.status(404).json({ message: "Home not found", data: null });
    }

    const hasReserved = await pool.query(
      "SELECT * FROM reservations WHERE home_id = $1 AND status = 'paid' AND start_date <= $2 AND end_date >= $3",
      [homeId, checkOut, checkIn]
    );
    if (hasReserved.rows.length > 0) {
      return res.status(400).json({
        message: "This home is already reserved in this date",
        data: null,
      });
    }

    const reservation = await pool.query(
      "INSERT INTO reservations (start_date, end_date, user_id, home_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [checkIn, checkOut, userId, homeId]
    );

    const days = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url:
        process.env.NODE_ENV == "production"
          ? `https://krelli-x86.netlify.app/properties/${homeId}`
          : `http://localhost:5001/properties/${homeId}`,
      cancel_url:
        process.env.NODE_ENV == "production"
          ? `https://krelli-x86.netlify.app/properties/${homeId}`
          : `http://localhost:5001/properties/${homeId}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${home.rows[0].title} - (${days} day * ${home.rows[0].price})`,
            },
            unit_amount: home.rows[0].price * days * 100,
          },
          quantity: 1,
        },
      ],
    });

    return res.status(200).json({
      message: "You just need to pay to complete your reservation",
      url: session.url,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ data: null, message: "Internal Server Error" });
  }
};

const createChat = async (req: authRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized", data: null });
  }
  const userId = req.user.id;

  const homeId = req.params.id;

  const house = await pool.query("SELECT * FROM homes WHERE id = $1", [homeId]);
  if (!house.rows[0]) {
    return res.status(404).json({ message: "Home not found", data: null });
  }

  const existingChat = await pool.query(
    "SELECT * FROM chats WHERE $1 = ANY(users) AND $2 = ANY(users)",
    [userId, house.rows[0].user_id]
  );
  if (existingChat.rows.length > 0) {
    return res.status(400).json({ message: "Chat already exists", data: null });
  }

  const home = await pool.query("SELECT * FROM homes WHERE id = $1", [homeId]);
  if (!home.rows[0]) {
    return res.status(404).json({ message: "Home not found", data: null });
  }

  const userIds = [userId, home.rows[0].user_id];
  const chat = await pool.query(
    "INSERT INTO chats (users, picture) VALUES ($1, $2) RETURNING *",
    [userIds, home.rows[0].picture]
  );

  return res.status(200).json({ data: chat.rows[0], message: "Chat created" });
};

const searchHomes = async (req: Request, res: Response) => {
  const { longitude, latitude, guests, checkIn, checkOut, category } =
    req.query;

  const homes = await pool.query(
    "SELECT * FROM homes WHERE ($1::float IS NULL OR longitude = $1) AND ($2::float IS NULL OR latitude = $2) AND ($3::text IS NULL OR category = $3)",
    [
      longitude ? parseFloat(longitude as string) : null,
      latitude ? parseFloat(latitude as string) : null,
      category,
    ]
  );

  res.status(200).json({ data: homes.rows, message: "Fetched successfully" });
};

const homePictures = async (req: Request, res: Response) => {
  const { id } = req.params;
  const home = await pool.query("SELECT * FROM homes WHERE id = $1", [id]);
  if (!home.rows[0]) {
    return res.status(404).json({ message: "Home not found", data: null });
  }
  const pictures = await pool.query(
    "SELECT * FROM pictures WHERE home_id = $1",
    [id]
  );
  return res.status(200).json({ data: pictures.rows, message: null });
};

const deleteReview = async (req: Request, res: Response) => {
  const review = await pool.query(
    "DELETE FROM reviews WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (!review.rows[0]) {
    return res
      .status(404)
      .json({ message: "Review does not exist", data: null });
  }
  return res.status(200).json({ message: "Deleted successfully", data: null });
};

const addReview = async (req: authRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized", data: null });
  }
  const userId = req.user.id;

  const homeId = req.params.id;
  const { rating, comment } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  if (!user.rows[0]) {
    return res.status(404).json({ message: "User not found", data: null });
  }

  const hasReserved = await pool.query(
    "SELECT * FROM reservations WHERE user_id = $1 AND home_id = $2 AND status = 'paid'",
    [userId, homeId]
  );
  if (!hasReserved.rows[0]) {
    return res
      .status(400)
      .json({ message: "You must reserve this home first", data: null });
  }

  const review = await pool.query(
    "INSERT INTO reviews (rating, comment, user_id, home_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [rating, comment, userId, homeId]
  );

  const reviews = await pool.query("SELECT * FROM reviews WHERE home_id = $1", [
    homeId,
  ]);
  const totalRating = reviews.rows.reduce(
    (acc, review) => acc + review.rating,
    0
  );
  const averageRating = totalRating / reviews.rows.length;

  await pool.query("UPDATE homes SET rating = $1 WHERE id = $2", [
    averageRating,
    homeId,
  ]);

  return res
    .status(200)
    .json({ data: review.rows[0], message: "Review added successfully" });
};

const allReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = await pool.query(
    "SELECT reviews.*, users.profile_image, users.username, users.created_at FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.home_id = $1",
    [id]
  );

  res.status(200).json({ data: reviews.rows, message: null });
};

// Enhanced properties search with geolocation
const searchPropertiesWithLocation = async (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10, // Default 10km radius
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      status,
      keyword,
      guests,
      bedrooms,
      bathrooms,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        properties.*,
        categories.name AS category_name,
        categories.description AS category_description,
        COALESCE(
          json_agg(
            json_build_object('id', pa.id, 'type', pa.type, 'url', pa.asset_url)
          ) FILTER (WHERE pa.id IS NOT NULL),
          '[]'
        ) AS assets,
        ${
          latitude && longitude
            ? `(6371 * acos(cos(radians($1)) * cos(radians(properties.latitude)) * 
           cos(radians(properties.longitude) - radians($2)) + 
           sin(radians($1)) * sin(radians(properties.latitude)))) AS distance`
            : "NULL AS distance"
        }
      FROM properties
      LEFT JOIN categories ON properties.category_id = categories.id
      LEFT JOIN property_assets pa ON properties.id = pa.property_id
      WHERE 1=1
    `;

    const queryValues: any[] = [];
    let valueIndex = 1;

    // Add geolocation filter if coordinates provided
    if (latitude && longitude) {
      query += ` AND (6371 * acos(cos(radians($${valueIndex})) * cos(radians(properties.latitude)) * 
                 cos(radians(properties.longitude) - radians($${valueIndex + 1})) + 
                 sin(radians($${valueIndex})) * sin(radians(properties.latitude)))) <= $${valueIndex + 2}`;
      queryValues.push(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string)
      );
      valueIndex += 3;
    }

    // Add other filters
    if (status) {
      query += ` AND properties.status = $${valueIndex}`;
      queryValues.push(status);
      valueIndex++;
    }

    if (category) {
      query += ` AND categories.name = $${valueIndex}`;
      queryValues.push(category);
      valueIndex++;
    }

    if (minPrice) {
      query += ` AND properties.price >= $${valueIndex}`;
      queryValues.push(parseFloat(minPrice as string));
      valueIndex++;
    }

    if (maxPrice) {
      query += ` AND properties.price <= $${valueIndex}`;
      queryValues.push(parseFloat(maxPrice as string));
      valueIndex++;
    }

    if (guests) {
      query += ` AND properties.guests >= $${valueIndex}`;
      queryValues.push(parseInt(guests as string));
      valueIndex++;
    }

    if (bedrooms) {
      query += ` AND properties.bedrooms >= $${valueIndex}`;
      queryValues.push(parseInt(bedrooms as string));
      valueIndex++;
    }

    if (bathrooms) {
      query += ` AND properties.bathrooms >= $${valueIndex}`;
      queryValues.push(parseInt(bathrooms as string));
      valueIndex++;
    }

    if (keyword) {
      query += ` AND (properties.title ILIKE $${valueIndex} OR properties.description ILIKE $${valueIndex})`;
      queryValues.push(`%${keyword}%`);
      valueIndex++;
    }

    query += ` GROUP BY properties.id, categories.id`;

    // Add ordering
    if (latitude && longitude) {
      query += ` ORDER BY distance ASC`;
    } else {
      query += ` ORDER BY properties.created_at DESC`;
    }

    query += ` LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    queryValues.push(limitNum, offset);

    const result = await pool.query(query, queryValues);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT properties.id) FROM properties 
                      LEFT JOIN categories ON properties.category_id = categories.id 
                      WHERE 1=1`;
    const countValues = queryValues.slice(0, -2); // Remove limit and offset

    if (latitude && longitude) {
      countQuery += ` AND (6371 * acos(cos(radians($1)) * cos(radians(properties.latitude)) * 
                      cos(radians(properties.longitude) - radians($2)) + 
                      sin(radians($1)) * sin(radians(properties.latitude)))) <= $3`;
    }

    // Add the same filters for count query
    let countValueIndex = latitude && longitude ? 4 : 1;
    if (status) {
      countQuery += ` AND properties.status = $${countValueIndex}`;
      countValueIndex++;
    }
    if (category) {
      countQuery += ` AND categories.name = $${countValueIndex}`;
      countValueIndex++;
    }
    // ... add other filters for count

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      data: result.rows,
      pagination: {
        total: totalCount,
        pages: totalPages,
        page: pageNum,
        limit: limitNum,
      },
      searchParams: {
        latitude: latitude ? parseFloat(latitude as string) : null,
        longitude: longitude ? parseFloat(longitude as string) : null,
        radius: parseFloat(radius as string),
      },
      message: "Properties fetched successfully with location search",
    });
  } catch (error) {
    console.error("Error in searchPropertiesWithLocation:", error);
    return res.status(500).json({
      message: "An error occurred while searching properties",
      error:
        process.env.NODE_ENV !== "production"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
    });
  }
};

// Get nearby properties based on current location
const getNearbyProperties = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const query = `
      SELECT 
        properties.*,
        categories.name AS category_name,
        (6371 * acos(cos(radians($1)) * cos(radians(properties.latitude)) * 
         cos(radians(properties.longitude) - radians($2)) + 
         sin(radians($1)) * sin(radians(properties.latitude)))) AS distance,
        (
          SELECT json_agg(json_build_object('id', pa.id, 'type', pa.type, 'url', pa.asset_url))
          FROM (
            SELECT id, type, asset_url 
            FROM property_assets 
            WHERE property_id = properties.id
            LIMIT 3
          ) pa
        ) AS assets
      FROM properties
      LEFT JOIN categories ON properties.category_id = categories.id
      WHERE properties.status = 'available'
        AND (6371 * acos(cos(radians($1)) * cos(radians(properties.latitude)) * 
             cos(radians(properties.longitude) - radians($2)) + 
             sin(radians($1)) * sin(radians(properties.latitude)))) <= $3
      ORDER BY distance ASC
      LIMIT 20
    `;

    const result = await pool.query(query, [
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string),
    ]);

    return res.json({
      data: result.rows,
      message: "Nearby properties fetched successfully",
    });
  } catch (error) {
    console.error("Error in getNearbyProperties:", error);
    return res.status(500).json({
      message: "An error occurred while fetching nearby properties",
    });
  }
};

// Get popular locations/areas with property counts
const getPopularLocations = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        wilaya,
        commune,
        COUNT(*) as property_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(latitude) as center_lat,
        AVG(longitude) as center_lng
      FROM properties 
      WHERE status = 'available'
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      GROUP BY wilaya, commune
      HAVING COUNT(*) >= 3
      ORDER BY property_count DESC
      LIMIT 15
    `;

    const result = await pool.query(query);

    return res.json({
      data: result.rows,
      message: "Popular locations fetched successfully",
    });
  } catch (error) {
    console.error("Error in getPopularLocations:", error);
    return res.status(500).json({
      message: "An error occurred while fetching popular locations",
    });
  }
};

// Enhanced search with advanced filters
const searchProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      searchText = "",
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      bathrooms,
      city,
      status = "available",
      sortBy = "created_at",
      sortOrder = "DESC",
      page = "1",
      limit = "12",
      amenities,
    } = req.query;

    let query = `
      SELECT 
        p.*,
        u.username as owner_name,
        u.profile_image as owner_image,
        COALESCE(
          json_agg(
            json_build_object('type', pa.type, 'url', pa.asset_url)
          ) FILTER (WHERE pa.id IS NOT NULL),
          '[]'
        ) AS assets,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT w.user_id) as wishlist_count
      FROM properties p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN property_assets pa ON p.id = pa.property_id
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN wishlists w ON p.id = w.property_id
      WHERE p.status = $1
    `;

    let queryParams: any[] = [status];
    let paramIndex = 2;

    // Text search
    if (searchText) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex})`;
      queryParams.push(`%${searchText}%`);
      paramIndex++;
    }

    // Price range
    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      queryParams.push(minPrice);
      paramIndex++;
    }
    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      queryParams.push(maxPrice);
      paramIndex++;
    }

    // Property type
    if (propertyType) {
      query += ` AND p.property_type = $${paramIndex}`;
      queryParams.push(propertyType);
      paramIndex++;
    }

    // Bedrooms
    if (bedrooms) {
      query += ` AND p.bedrooms >= $${paramIndex}`;
      queryParams.push(bedrooms);
      paramIndex++;
    }

    // Bathrooms
    if (bathrooms) {
      query += ` AND p.bathrooms >= $${paramIndex}`;
      queryParams.push(bathrooms);
      paramIndex++;
    }

    // City
    if (city) {
      query += ` AND p.city ILIKE $${paramIndex}`;
      queryParams.push(`%${city}%`);
      paramIndex++;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query += ` AND p.amenities @> $${paramIndex}::jsonb`;
      queryParams.push(JSON.stringify(amenitiesArray));
      paramIndex++;
    }

    query += ` GROUP BY p.id, u.username, u.profile_image`;

    // Sorting
    const allowedSortFields = [
      "price",
      "created_at",
      "title",
      "bedrooms",
      "bathrooms",
    ];
    const allowedSortOrders = ["ASC", "DESC"];

    if (
      allowedSortFields.includes(sortBy as string) &&
      allowedSortOrders.includes((sortOrder as string).toUpperCase())
    ) {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    // Pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit as string), offset);

    const properties = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      WHERE p.status = $1
    `;
    let countParams = [status];
    let countIndex = 2;

    // Apply same filters to count query
    if (searchText) {
      countQuery += ` AND (p.title ILIKE $${countIndex} OR p.description ILIKE $${countIndex} OR p.city ILIKE $${countIndex})`;
      countParams.push(`%${searchText}%`);
      countIndex++;
    }
    if (minPrice) {
      countQuery += ` AND p.price >= $${countIndex}`;
      countParams.push(minPrice);
      countIndex++;
    }
    if (maxPrice) {
      countQuery += ` AND p.price <= $${countIndex}`;
      countParams.push(maxPrice);
      countIndex++;
    }
    if (propertyType) {
      countQuery += ` AND p.property_type = $${countIndex}`;
      countParams.push(propertyType);
      countIndex++;
    }
    if (bedrooms) {
      countQuery += ` AND p.bedrooms >= $${countIndex}`;
      countParams.push(bedrooms);
      countIndex++;
    }
    if (bathrooms) {
      countQuery += ` AND p.bathrooms >= $${countIndex}`;
      countParams.push(bathrooms);
      countIndex++;
    }
    if (city) {
      countQuery += ` AND p.city ILIKE $${countIndex}`;
      countParams.push(`%${city}%`);
      countIndex++;
    }
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      countQuery += ` AND p.amenities @> $${countIndex}::jsonb`;
      countParams.push(JSON.stringify(amenitiesArray));
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit as string));

    return res.status(200).json({
      success: true,
      data: {
        properties: properties.rows,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit as string),
          hasNextPage: parseInt(page as string) < totalPages,
          hasPrevPage: parseInt(page as string) > 1,
        },
        filters: {
          searchText,
          minPrice,
          maxPrice,
          propertyType,
          bedrooms,
          bathrooms,
          city,
          status,
          amenities,
        },
      },
      message: "Properties retrieved successfully",
    });
  } catch (error) {
    logger.error("Error searching properties:", error);
    return next(error);
  }
};

// Get similar properties based on location and price
const getSimilarProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { property_id } = req.params;
    const { limit = "6" } = req.query;

    // First get the current property details
    const currentProperty = await pool.query(
      `
      SELECT city, price, property_type, bedrooms, bathrooms
      FROM properties
      WHERE id = $1
    `,
      [property_id]
    );

    if (!currentProperty.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const { city, price, property_type, bedrooms, bathrooms } =
      currentProperty.rows[0];
    const priceRange = price * 0.3; // 30% price range

    const similarProperties = await pool.query(
      `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object('type', pa.type, 'url', pa.asset_url)
          ) FILTER (WHERE pa.id IS NOT NULL),
          '[]'
        ) AS assets,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM properties p
      LEFT JOIN property_assets pa ON p.id = pa.property_id
      LEFT JOIN reviews r ON p.id = r.property_id
      WHERE p.id != $1
        AND p.status = 'available'
        AND (
          p.city = $2
          OR p.property_type = $3
          OR (p.price BETWEEN $4 AND $5)
          OR (p.bedrooms = $6 AND p.bathrooms = $7)
        )
      GROUP BY p.id
      ORDER BY 
        CASE WHEN p.city = $2 THEN 1 ELSE 2 END,
        CASE WHEN p.property_type = $3 THEN 1 ELSE 2 END,
        ABS(p.price - $8)
      LIMIT $9
    `,
      [
        property_id,
        city,
        property_type,
        price - priceRange,
        price + priceRange,
        bedrooms,
        bathrooms,
        price,
        parseInt(limit as string),
      ]
    );

    return res.status(200).json({
      success: true,
      data: similarProperties.rows,
      message: "Similar properties retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching similar properties:", error);
    return next(error);
  }
};

// Increment property views
const incrementPropertyViews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE properties 
      SET views = COALESCE(views, 0) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Property view recorded",
    });
  } catch (error) {
    logger.error("Error incrementing property views:", error);
    return next(error);
  }
};

export {
  addPropertyController,
  getProperties,
  getProperty,
  getRecommendedProperties,
  reserveProperty,
  addReservationWithStripe,
  createChat,
  searchHomes,
  homePictures,
  deleteReview,
  addReview,
  allReviews,
  searchPropertiesWithLocation,
  getNearbyProperties,
  getPopularLocations,
  searchProperties,
  getSimilarProperties,
  incrementPropertyViews,
};
