import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  plan: { type: String, default: "trial" },
  profileLimit: { type: Number, default: 8 },
  trialEndsAt: { type: Date },
  proxies: {
    default: { type: Number, default: 5 },
    customLimit: { type: Number, default: 3 }
  },
  paddleSubscriptionId: { type: String }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
