import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
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
      },
    ],
  },
  { timestamps: true } // optional, adds createdAt / updatedAt
);

export default mongoose.model("Cart", cartSchema);
