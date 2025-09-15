import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import webhookRoutes from "./routes/webhook.js";
import cryptoRoutes from "./routes/crypto.js";

dotenv.config();

const app = express();

// ✅ Paddle webhook (must be first, raw body)
app.use("/webhook", webhookRoutes);

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/crypto", cryptoRoutes);

app.get("/", (req, res) => {
  res.send("WebLogin API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
