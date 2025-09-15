import express from "express";
import crypto from "crypto";

const router = express.Router();

/**
 * ✅ Verify Paddle signature
 */
function verifyPaddleSignature(body, signature, publicKey) {
  try {
    const verifier = crypto.createVerify("sha1");

    // p_signature को छोड़कर बाकी keys sort करो
    const keys = Object.keys(body)
      .filter((key) => key !== "p_signature")
      .sort();

    const sorted = {};
    keys.forEach((key) => {
      sorted[key] = body[key];
    });

    // Serialize sorted object
    const serialized = JSON.stringify(sorted);

    verifier.update(serialized);
    return verifier.verify(publicKey, Buffer.from(signature, "base64"));
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * ✅ Webhook route
 */
router.post(
  "/webhook",
  express.urlencoded({ extended: false }),
  (req, res) => {
    const body = req.body;
    const signature = body.p_signature;

    // Paddle Public Key (env file से लो)
    const PADDLE_PUBLIC_KEY = process.env.PADDLE_PUBLIC_KEY;

    if (!signature || !verifyPaddleSignature(body, signature, PADDLE_PUBLIC_KEY)) {
      console.log("❌ Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    // ✅ अब events handle करो
    const event = body.alert_name;
    console.log("📩 Paddle Webhook Received:", event);

    switch (event) {
      case "subscription_created":
        console.log("✅ Subscription Created:", body);
        // 👉 यहाँ user को database में Pro plan दो
        break;

      case "subscription_cancelled":
        console.log("⚠️ Subscription Cancelled:", body);
        // 👉 यहाँ user का plan free कर दो
        break;

      case "subscription_payment_succeeded":
        console.log("💰 Payment Success:", body);
        // 👉 Payment log save करो
        break;

      case "subscription_payment_failed":
        console.log("❌ Payment Failed:", body);
        break;

      default:
        console.log("ℹ️ Unhandled Event:", event);
    }

    res.sendStatus(200);
  }
);

export default router;
      
