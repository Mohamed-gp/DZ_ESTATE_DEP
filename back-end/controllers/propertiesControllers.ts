import multer from "multer";
import cloudinary from "../config/cloudinary";
import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";
// am gonna add chargily later since it don't work with typescript 
// import Chargily from "@chargily/chargily-pay";
import Stripe from "stripe";
import { authRequest } from "../interfaces/authInterface";
import removefiles from "../utils/cleanUpload";
import { validateCreateProperty } from "../utils/joiValidation";



// const client = new Chargily.ChargilyClient({
//   api_key: process.env.CHARGILY_SECRET_KEY,
//   mode: "test",
// });


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});



const addPropertyController = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    console.log(req.user.id);

    const { error } = validateCreateProperty(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        data: null,
      });
    }

    const { title, description, price, status, commune, quartier, wilaya, longitude, latitude, guests, bedrooms, bathrooms, category } = req.body;

    const files = req.files as Express.Multer.File[];

    // Vérifier le nombre minimum de fichiers (images ou vidéos)
    if (files.length < 6) {
      return res.status(400).json({
        message: "You must upload at least 6 files (images or videos)",
        data: null,
      });
    }

    // Séparer les fichiers images et vidéos selon leur type MIME
    const imageFiles = files.filter((file) => file.mimetype.startsWith("image/"));
    const videoFiles = files.filter((file) => file.mimetype.startsWith("video/"));

    // Uploader les images
    const uploadedImages = await Promise.all(
      imageFiles.map((image) => cloudinary.uploader.upload(image.path, { resource_type: "image" }))
    );

    // Uploader les vidéos
    const uploadedVideos = await Promise.all(
      videoFiles.map((video) => cloudinary.uploader.upload(video.path, { resource_type: "video" }))
    );

    const createdProperty = await pool.query(
      `INSERT INTO properties 
      (title, description, price, status, commune, quartier, wilaya, longitude, latitude, guests, bedrooms, bathrooms, owner_id, category_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *`,
      [title, description, price, status, commune, quartier, +wilaya, +longitude, +latitude, 2, bedrooms, bathrooms, req.user.id, 2]
    );

    const propertyId = createdProperty.rows[0].id;

    // Ajouter les URLs des images dans la table `property_assets`
    for (const uploadedImage of uploadedImages) {
      await pool.query(
        `INSERT INTO property_assets (property_id, asset_url, type) 
        VALUES ($1, $2, $3) RETURNING *`,
        [propertyId, uploadedImage.secure_url, "image"]
      );
    }

    // Ajouter les URLs des vidéos dans la table `property_assets`
    for (const uploadedVideo of uploadedVideos) {
      await pool.query(
        `INSERT INTO property_assets (property_id, asset_url, type) 
        VALUES ($1, $2, $3) RETURNING *`,
        [propertyId, uploadedVideo.secure_url, "video"]
      );
    }

    // Nettoyer les fichiers temporaires (facultatif)
    removefiles();

    return res.status(201).json({
      data: createdProperty.rows[0],
      message: "Property added successfully with images and videos",
    });
  } catch (error) {
    next(error);
  }
};



const getProperties = async (req: Request, res: Response) => {
  let { category, minPrice, maxPrice, page, limit, status, keyword } = req.query;

  let query = `
    SELECT 
      properties.*,
      COALESCE(
        json_agg(
          json_build_object('type', property_assets.type, 'url', property_assets.asset_url)
        ) FILTER (WHERE property_assets.id IS NOT NULL),
        '[]'
      ) AS assets,
      json_build_object('id', categories.id, 'name', categories.name, 'description', categories.description) AS category
    FROM properties
    LEFT JOIN property_assets ON properties.id = property_assets.property_id
    LEFT JOIN categories ON properties.category_id = categories.id
    WHERE 1=1
  `;
  let queryValues: any[] = [];
  let index = 1;

  if (status) {
    query += ` AND status = $${index}`;
    queryValues.push(status);
    index++;
  }

  if (category) {
    const categoryResult = await pool.query("SELECT id FROM categories WHERE name = $1", [category]);
    if (categoryResult.rows.length > 0) {
      query += ` AND category_id = $${index}`;
      queryValues.push(categoryResult.rows[0].id);
      index++;
    }
  }

  if (minPrice) {
    query += ` AND price >= $${index}`;
    queryValues.push(+minPrice);
    index++;
  }

  if (maxPrice) {
    query += ` AND price <= $${index}`;
    queryValues.push(+maxPrice);
    index++;
  }

  if (keyword) {
    query += ` AND (properties.title ILIKE $${index} OR properties.description ILIKE $${index})`;
    queryValues.push(`%${keyword}%`);
    index++;
  }

  query += `
    GROUP BY properties.id, categories.id
  `;

  if (page && limit) {
    const startIndex = (+page - 1) * +limit;
    query += ` LIMIT $${index} OFFSET $${index + 1}`;
    queryValues.push(+limit, startIndex);
  }

  try {
    const properties = await pool.query(query, queryValues);
    return res.json({ data: properties.rows, message: "Properties fetched successfully" });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ message: "An error occurred while fetching properties" });
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
      ) AS assets
    FROM properties
    LEFT JOIN users ON properties.owner_id = users.id
    LEFT JOIN property_assets ON properties.id = property_assets.property_id
    WHERE properties.id = $1
    GROUP BY properties.id, users.id
  `;

  try {
    const property = await pool.query(query, [id]);

    if (!property.rows.length) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({ data: property.rows[0], message: "Property fetched successfully" });
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({ message: "An error occurred while fetching the property" });
  }
};



const getRecommendedProperties = async (req: Request, res: Response) => {
  const properties = await pool.query("SELECT * FROM properties ORDER BY RANDOM() LIMIT 8");
  if (!properties.rows[0]) {
    return res.json({ message: "No property found", data: null });
  }
  return res.json({ data: properties.rows, message: "Properties fetched successfully" });
};




const reserveProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  const property = await pool.query("SELECT * FROM properties WHERE id = $1", [id]);
  if (!property.rows[0]) {
    return res.json({ message: "Property not found" });
  }
  const reservedProperty = await pool.query(
    "INSERT INTO reserved_properties (property_id, user_id) VALUES ($1, $2) RETURNING *",
    [id, userId]
  );
  return res.json({ data: reservedProperty.rows[0], message: "Property reserved successfully" });
};

// const addReservationWithChargily = async (req: authRequest, res: Response) => {
//   try {
//     const userId = req.user.id;
//     const homeId = req.params.id;

//     let { checkIn, checkOut } = req.body;
//     checkIn = new Date(checkIn);
//     checkOut = new Date(checkOut);

//     if (checkIn > checkOut) {
//       return res.status(400).json({
//         data: null,
//         message: "Check out date must be greater than check in date",
//       });
//     }
//     if (checkIn < new Date()) {
//       return res.status(400).json({
//         message: "Check in date must be greater than today",
//         data: null,
//       });
//     }

//     const home = await pool.query("SELECT * FROM homes WHERE id = $1", [homeId]);
//     if (!home.rows[0]) {
//       return res.status(404).json({ message: "Home not found", data: null });
//     }

//     const hasReserved = await pool.query(
//       "SELECT * FROM reservations WHERE home_id = $1 AND status = 'paid' AND start_date <= $2 AND end_date >= $3",
//       [homeId, checkOut, checkIn]
//     );
//     if (hasReserved.rows.length > 0) {
//       return res.status(400).json({
//         message: "This home is already reserved in this date",
//         data: null,
//       });
//     }

//     const reservation = await pool.query(
//       "INSERT INTO reservations (start_date, end_date, user_id, home_id) VALUES ($1, $2, $3, $4) RETURNING *",
//       [checkIn, checkOut, userId, homeId]
//     );

//     const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//     const newCheckout = await client.createCheckout({
//       amount: home.rows[0].price * days,
//       currency: "dzd",
//       success_url: "https://krelli.production-server.tech/chargily/success",
//       failure_url: "https://krelli.production-server.tech/chargily/failure",
//       metadata: [{ reservationId: reservation.rows[0].id }],
//     });

//     res.status(200).json({
//       message: "You just need to pay to complete your reservation",
//       url: newCheckout.checkout_url,
//     });
//   } catch (error) {
//     res.status(500).json({ data: null, message: "Internal Server Error" });
//   }
// };

const addReservationWithStripe = async (req: authRequest, res: Response) => {
  try {
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

    const home = await pool.query("SELECT * FROM homes WHERE id = $1", [homeId]);
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

    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

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

    res.status(200).json({
      message: "You just need to pay to complete your reservation",
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({ data: null, message: "Internal Server Error" });
  }
};

const createChat = async (req: authRequest, res: Response) => {
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

  res.status(200).json({ data: chat.rows[0], message: "Chat created" });
};

const searchHomes = async (req: Request, res: Response) => {
  const { longitude, latitude, guests, checkIn, checkOut, category } = req.query;

  const homes = await pool.query(
    "SELECT * FROM homes WHERE ($1::float IS NULL OR longitude = $1) AND ($2::float IS NULL OR latitude = $2) AND ($3::text IS NULL OR category = $3)",
    [longitude ? parseFloat(longitude as string) : null, latitude ? parseFloat(latitude as string) : null, category]
  );

  res.status(200).json({ data: homes.rows, message: "Fetched successfully" });
};

const homePictures = async (req: Request, res: Response) => {
  const { id } = req.params;
  const home = await pool.query("SELECT * FROM homes WHERE id = $1", [id]);
  if (!home.rows[0]) {
    return res.status(404).json({ message: "Home not found", data: null });
  }
  const pictures = await pool.query("SELECT * FROM pictures WHERE home_id = $1", [id]);
  res.status(200).json({ data: pictures.rows, message: null });
};

const deleteReview = async (req: Request, res: Response) => {
  const review = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [req.params.id]);
  if (!review.rows[0]) {
    return res.status(404).json({ message: "Review does not exist", data: null });
  }
  return res.status(200).json({ message: "Deleted successfully", data: null });
};

const addReview = async (req: authRequest, res: Response) => {
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
    return res.status(400).json({ message: "You must reserve this home first", data: null });
  }

  const review = await pool.query(
    "INSERT INTO reviews (rating, comment, user_id, home_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [rating, comment, userId, homeId]
  );

  const reviews = await pool.query("SELECT * FROM reviews WHERE home_id = $1", [homeId]);
  const totalRating = reviews.rows.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.rows.length;

  await pool.query("UPDATE homes SET rating = $1 WHERE id = $2", [averageRating, homeId]);

  res.status(200).json({ data: review.rows[0], message: "Review added successfully" });
};

const allReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = await pool.query(
    "SELECT reviews.*, users.profile_image, users.username, users.created_at FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.home_id = $1",
    [id]
  );

  res.status(200).json({ data: reviews.rows, message: null });
};

export {
  addPropertyController,
  getProperties,
  getProperty,
  getRecommendedProperties,
  reserveProperty,
  // addReservationWithChargily,
  addReservationWithStripe,
  createChat,
  searchHomes,
  homePictures,
  deleteReview,
  addReview,
  allReviews,
};