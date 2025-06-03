import { Request, Response } from "express";
import Stripe from "stripe";
import pool from "../config/connectDb";
import stripe from "../utils/stripe";

interface CheckoutSessionMetadata {
  property_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const sig = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return res.status(400).send("Webhook secret or signature missing");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = err as Error;
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as CheckoutSessionMetadata;

      if (session.mode === "payment" && session.payment_status === "paid") {
        const { property_id, user_id, start_date, end_date } = metadata;

        if (start_date && end_date) {
          // Create reservation
          await pool.query(
            `INSERT INTO reservations (user_id, property_id, start_date, end_date, status, payment_method, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, 'confirmed', 'stripe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [user_id, property_id, start_date, end_date]
          );
        } else if (property_id) {
          // Mark property as sold
          await pool.query(
            `UPDATE properties SET status = 'sold' WHERE id = $1`,
            [property_id]
          );
        }
      }
      break;
    }
    // Handle other event types as needed
    default:
      return res.status(400).send(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
};

export { handleStripeWebhook };
