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
