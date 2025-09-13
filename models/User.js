const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ["free", "pro", "pro_ads", "business"], default: "free" },
  trialEndsAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
