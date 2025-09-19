import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import paddleRoutes from "./routes/paddle.js";
import binanceRoutes from "./routes/binance.js";

dotenv.config();
const app = express();

await connectDB();

// middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// routes
app.use("/auth", authRoutes);
app.use("/paddle", paddleRoutes);
app.use("/crypto", binanceRoutes);

app.get("/healthz", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ðŸš€ Server listening on ${PORT}`));
