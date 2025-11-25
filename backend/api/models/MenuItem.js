import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    itemGroup: { type: String, enum: ["drink", "main", "side", "other"], default: "other" },
    image: String,
    available: { type: Boolean, default: true },
    prepTime: { type: Number, default: 15 }, // in minutes
    orderCount: { type: Number, default: 0 }, // Cached popularity metric
    lastOrdered: { type: Date } // For time-weighted popularity
  },
  { timestamps: true }
);

// Indexes for ML recommendation queries
menuItemSchema.index({ category: 1, available: 1 });
menuItemSchema.index({ price: 1, prepTime: 1 });
menuItemSchema.index({ orderCount: -1 });
menuItemSchema.index({ available: 1, price: 1, prepTime: 1 }); // Compound index for smart-suggestions

export default mongoose.model("MenuItem", menuItemSchema);
