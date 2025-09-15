import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// ✅ Create checkout link for Paddle
router.post("/create-checkout", async (req, res) => {
  try {
    const { planId, userEmail } = req.body;

    const resp = await fetch("https://vendors.paddle.com/api/2.0/subscription/users_create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: process.env.PADDLE_VENDOR_ID,
        vendor_auth_code: process.env.PADDLE_API_KEY,
        plan_id: planId,
        email: userEmail
      })
    });

    const data = await resp.json();
    if (!data.success) {
      return res.status(400).json({ success: false, error: data.error });
    }

    res.json({ success: true, checkoutUrl: data.response.checkout_url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, message: "Checkout error" });
  }
});

export default router;
