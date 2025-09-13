require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// MongoDB connect
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('✅ WebLogin Backend Working with MongoDB!');
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();
app.use(express.json());

require("./config/db")(); // DB connect function

app.get("/", (req, res) => {
  res.send("Backend working with MongoDB!");
});

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
