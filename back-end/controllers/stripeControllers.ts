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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Update your database with the payment status
      await pool.query(
        `UPDATE orders SET status = 'paid' WHERE payment_intent_id = $1`,
        [paymentIntent.id]
      );
      break;
    case "payment_intent.payment_failed":
      const paymentFailedIntent = event.data.object as Stripe.PaymentIntent;
      // Update your database with the payment status
      await pool.query(
        `UPDATE orders SET status = 'failed' WHERE payment_intent_id = $1`,
        [paymentFailedIntent.id]
      );
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

export { handleStripeWebhook };
