const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");

// Use Routes
app.use("/api/auth", authRoutes);

// MongoDB Connect
const connectDB = require("./config/db");
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
