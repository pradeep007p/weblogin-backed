import express from "express";
import crypto from "crypto";

const router = express.Router();

// Paddle Webhook
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const signature = req.headers["paddle-signature"]; // Signature from Paddle
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).send("Missing signature or secret");
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(req.body);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      console.error("⚠️ Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    // Parse the webhook event
    const event = JSON.parse(req.body.toString());
    console.log("✅ Paddle Webhook Event:", event);

    // ✅ Handle subscription events
    switch (event.type) {
      case "subscription.created":
        console.log("🆕 Subscription Created:", event.data);
        // TODO: Save new subscription in DB (userId, plan, status, expiryDate)
        break;

      case "transaction.completed":
        console.log("💰 Payment Success:", event.data);
        // TODO: Update subscription/payment history in DB
        break;

      case "subscription.cancelled":
        console.log("❌ Subscription Cancelled:", event.data);
        // TODO: Mark subscription as inactive in DB
        break;

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(500).send("Server error");
  }
});

export default router;
        
