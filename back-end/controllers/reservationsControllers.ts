import { Response, NextFunction } from "express";
import { authRequest } from "../interfaces/authInterface";
import pool from "../config/connectDb";
import stripe from "../utils/stripe";

const reserveOrBuyProperty = async (
  req: authRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { property_id, start_date, end_date } = req.body;
  const user_id = req.user.id;

  try {
    // Fetch the property details
    const propertyResult = await pool.query(
      `SELECT * FROM properties WHERE id = $1`,
      [property_id]
    );

    if (!propertyResult.rows.length) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = propertyResult.rows[0];

    if (property.status === "rent") {
      // Check for overlapping reservations
      const overlappingReservations = await pool.query(
        `SELECT * FROM reservations 
         WHERE property_id = $1 
         AND (start_date, end_date) OVERLAPS ($2::DATE, $3::DATE)`,
        [property_id, start_date, end_date]
      );

      if (overlappingReservations.rows.length > 0) {
        return res.status(400).json({
          message: "The property is already reserved for the selected dates",
        });
      }

      // Create a Stripe Checkout Session for the reservation
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: property.title,
              },
              unit_amount: property.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/reservation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/reservation-cancel`,
        metadata: {
          property_id: property.id,
          user_id: user_id,
          start_date,
          end_date,
        },
      });

      return res.status(201).json({
        url: session.url,
        message: "Reservation session created successfully",
      });
    } else if (property.status === "sell") {
      // Create a Stripe Checkout Session for the purchase
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: property.title,
              },
              unit_amount: property.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        metadata: {
          property_id: property.id,
          user_id: user_id,
        },
      });

      return res.status(201).json({
        url: session.url,
        message: "Purchase session created successfully",
      });
    } else {
      return res.status(400).json({ message: "Invalid property status" });
    }
  } catch (error) {
    console.error("Error in reserveOrBuyProperty:", error);
    return res.status(500).json({
      message: "An error occurred while processing the request",
    });
  }
};

export { reserveOrBuyProperty };
