import express from "express";
import crypto from "crypto";

const router = express.Router();

// Paddle webhook handler
router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const signature = req.headers["paddle-signature"];
    const rawBody = req.body.toString("utf8");

    // ✅ Verify Paddle webhook (public key from .env)
    const verifier = crypto.createVerify("sha1");
    verifier.update(rawBody);
    const isValid = verifier.verify(process.env.PADDLE_PUBLIC_KEY, signature, "base64");

    if (!isValid) {
      console.error("❌ Invalid Paddle signature");
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(rawBody);
    console.log("✅ Paddle Event:", event);

    // Example: handle subscription created
    if (event.alert_name === "subscription_created") {
      console.log("New subscription:", event.subscription_id);
      // TODO: Update user in DB
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Webhook error");
  }
});

export default router;
