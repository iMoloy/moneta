import mongoose from "mongoose";

const depositSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["card", "bank"], required: true },
    details: { type: String, default: "" }, // e.g. "*4221"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DepositSource = mongoose.models.DepositSource || mongoose.model("DepositSource", depositSourceSchema);
export default DepositSource;
