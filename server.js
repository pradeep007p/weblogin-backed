import express from "express";
import bodyParser from "body-parser";
import paddleRoutes from "./routes/paddle.js";

const app = express();

// JSON parser for normal routes
app.use(bodyParser.json());

// Paddle webhook (raw body required for signature verification)
app.use("/paddle", paddleRoutes);

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
