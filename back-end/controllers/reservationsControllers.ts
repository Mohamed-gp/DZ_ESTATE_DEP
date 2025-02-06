import { NextFunction, Request, Response } from "express";
import pool from "../config/connectDb";
import Stripe from "stripe";
import { authRequest } from "../interfaces/authInterface";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

const reserveOrBuyProperty = async (req: authRequest, res: Response, next: NextFunction) => {
  const { property_id, start_date, end_date, payment_method } = req.body;
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

    if (property.status === 'rent') {
      // Check for overlapping reservations
      const overlappingReservations = await pool.query(
        `SELECT * FROM reservations 
         WHERE property_id = $1 
         AND (start_date, end_date) OVERLAPS ($2::DATE, $3::DATE)`,
        [property_id, start_date, end_date]
      );

      if (overlappingReservations.rows.length > 0) {
        return res.status(400).json({ message: "The property is already reserved for the selected dates" });
      }

      // Handle payment
      const amount = property.price * 100; // Convert to cents for Stripe

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { property_id: property.id, user_id },
      });

      // Confirm the payment
      const paymentConfirmation = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method,
      });

      if (paymentConfirmation.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment failed" });
      }

      // Create reservation
      const reservationResult = await pool.query(
        `INSERT INTO reservations (user_id, property_id, start_date, end_date, status, payment_method, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, 'confirmed', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [user_id, property_id, start_date, end_date, payment_method]
      );

      return res.status(201).json({
        data: reservationResult.rows[0],
        message: "Reservation created successfully",
      });
    } else if (property.status === 'sell') {
      // Handle payment
      const amount = property.price * 100; // Convert to cents for Stripe

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { property_id: property.id, user_id },
      });

      // Confirm the payment
      const paymentConfirmation = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method,
      });

      if (paymentConfirmation.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment failed" });
      }

      // Mark property as sold or remove from listings
      await pool.query(
        `UPDATE properties SET status = 'sold' WHERE id = $1`,
        [property_id]
      );

      return res.status(201).json({
        data: paymentConfirmation,
        message: "Property purchased successfully",
      });
    } else {
      return res.status(400).json({ message: "Invalid property status" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ message: "An error occurred while processing the request" });
  }
};

export { reserveOrBuyProperty };