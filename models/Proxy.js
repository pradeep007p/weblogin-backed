const mongoose = require('mongoose');

const ProxySchema = new mongoose.Schema({
  host: String,
  port: Number,
  user: String,
  pass: String,
  encrypted: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  healthy: { type: Boolean, default: true },
  pool: { type: String, enum: ['default','premium'], default: 'default' }
}, { timestamps: true });

module.exports = mongoose.model('Proxy', ProxySchema);
