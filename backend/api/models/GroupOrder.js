// backend/api/models/GroupOrder.js
import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
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
});

const groupOrderItemSchema = new mongoose.Schema({
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
  customizations: [customizationSchema],
  mealGroupId: {
    type: String,
  },
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [groupOrderItemSchema],
  joined: {
    type: Date,
    default: Date.now,
  },
});

const groupOrderSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [participantSchema],
    status: {
      type: String,
      enum: ["open", "finalized", "completed"],
      default: "open",
    },
    shareCode: {
      type: String,
      unique: true,
      required: true,
    },
    splitType: {
      type: String,
      enum: ["equal", "itemized"],
      default: "equal",
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    tip: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GroupOrder", groupOrderSchema);
