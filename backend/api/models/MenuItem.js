import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    image: String,
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
