import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import webhookRoutes from "./routes/webhook.js"; // ✅ नया webhook route import किया

dotenv.config();

const app = express();

// ✅ Webhook के लिए json से पहले urlencoded use करो
app.use("/webhook", webhookRoutes);

// बाकी middlewares
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/subscriptions", subscriptionRoutes);

app.get("/", (req, res) => {
  res.send("WebLogin API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// MongoDB Connect
const connectDB = require("./config/db");
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
