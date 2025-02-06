import { Request, Response } from "express";
import Stripe from "stripe";
import pool from "../config/connectDb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "payment" && session.payment_status === "paid") {
        const { property_id, user_id, start_date, end_date } = session.metadata;

        if (session.metadata.start_date && session.metadata.end_date) {
          // Create reservation
          await pool.query(
            `INSERT INTO reservations (user_id, property_id, start_date, end_date, status, payment_method, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, 'confirmed', 'stripe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [user_id, property_id, start_date, end_date]
          );
        } else {
          // Mark property as sold
          await pool.query(
            `UPDATE properties SET status = 'sold' WHERE id = $1`,
            [property_id]
          );
        }
      }
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

export { handleStripeWebhook };
