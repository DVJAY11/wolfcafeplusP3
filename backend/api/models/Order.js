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
  orderTime: { type: Number, min: 0, max: 23 }, // Hour of day (0-23)
  dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday, 6=Saturday
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for ML recommendation queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.menuItem": 1 });
orderSchema.index({ orderTime: 1, dayOfWeek: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to set orderTime and dayOfWeek
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    const now = this.createdAt || new Date();
    this.orderTime = now.getHours();
    this.dayOfWeek = now.getDay();
  }

  // Set completedAt when status changes to completed
  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// Post-save hook to update user preferences when order is completed
orderSchema.post("save", async function (doc) {
  // Only trigger preference update when order is completed
  if (doc.status === "completed") {
    try {
      // Import dynamically to avoid circular dependencies
      const { buildUserProfile } = await import("../services/recommendationService.js");

      // Update user preferences asynchronously (don't wait for it)
      buildUserProfile(doc.user.toString()).catch((err) => {
        console.error("Error updating user preferences after order completion:", err);
      });
    } catch (err) {
      console.error("Error importing recommendationService:", err);
    }
  }
});

export default mongoose.model("Order", orderSchema);

