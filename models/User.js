const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: String,
  proxy: { host:String, port:Number, user:String, pass:String },
  active: { type:Boolean, default:true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  plan: { type: String, enum: ['free','pro_ads','pro_adfree','business'], default: 'free' },
  adsEnabled: { type: Boolean, default: true },
  profileLimit: { type: Number, default: 5 },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  trialEndsAt: Date,
  profiles: [ProfileSchema],
  createdAt: { type: Date, default: Date.now },
  totpSecret: String
});

module.exports = mongoose.model('User', UserSchema);
