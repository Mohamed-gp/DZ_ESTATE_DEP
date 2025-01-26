import express from "express";
import webhook from "../../controllers/stripeControllers";


const stripeRouter = express.Router();

stripeRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

stripeRouter.get("/success", (req, res) => {
  res.json({ data: null, message: "payment completed successfully" });
});
stripeRouter.get("/failed", (req, res) => {
  res.json({ data: null, message: "payment has failure" });
});

export default stripeRouter;
