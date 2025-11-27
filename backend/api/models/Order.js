import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      quantity: Number,
      customizations: [
        {
          ingredientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      mealGroupId: {
        type: String,
      },
    }
  ],
  subtotal: { type: Number, required: true },
  tip: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "ready", "completed"],
    default: "pending"
  },
  total: Number,
  subtotal: Number,
  tax: Number,
  tip: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
