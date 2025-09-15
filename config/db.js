const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI set in environment');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('MongoDB Connected ✅');
  } catch (err) {
    logger.error('MongoDB Connection Failed: ' + err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
