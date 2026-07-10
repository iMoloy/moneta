import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cardholderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    last4: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    brand: {
      type: String,
      enum: ["Visa", "Mastercard", "Amex", "Other"],
      default: "Other",
    },
    expMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    expYear: {
      type: Number,
      required: true,
      min: new Date().getFullYear(),
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.models.Card || mongoose.model("Card", cardSchema);
export default Card;
