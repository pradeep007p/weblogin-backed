import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paddleSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trialing"],
      default: "active",
    },
    nextBillingDate: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
