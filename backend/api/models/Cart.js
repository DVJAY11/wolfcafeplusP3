import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
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
      },
    ],
  },
  { timestamps: true } // optional, adds createdAt / updatedAt
);

export default mongoose.model("Cart", cartSchema);
