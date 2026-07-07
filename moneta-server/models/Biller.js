import mongoose from "mongoose";

const billerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "utility" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Biller = mongoose.models.Biller || mongoose.model("Biller", billerSchema);
export default Biller;
