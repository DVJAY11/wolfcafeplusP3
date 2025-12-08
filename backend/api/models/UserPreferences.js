import mongoose from "mongoose";

const userPreferencesSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		// Favorite categories based on order history
		favoriteCategories: [
			{
				category: { type: String },
				orderCount: { type: Number, default: 0 },
			},
		],
		// Favorite item groups (drink, main, side)
		favoriteItemGroups: [
			{
				itemGroup: { type: String, enum: ["drink", "main", "side", "other"] },
				orderCount: { type: Number, default: 0 },
			},
		],
		// Most frequently ordered items
		favoriteItems: [
			{
				menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
				orderCount: { type: Number, default: 0 },
				lastOrdered: { type: Date },
			},
		],
		// Dietary preferences inferred from orders
		dietaryPreferences: [
			{
				type: String,
				enum: ["vegan", "vegetarian", "keto", "gluten-free", "dairy-free", "nut-free"],
			},
		],
		// Allergens to avoid (inferred from never ordering items with these allergens)
		avoidedAllergens: [
			{
				type: String,
				enum: ["dairy", "nuts", "gluten", "soy", "eggs", "shellfish", "fish"],
			},
		],
		// Budget patterns
		budgetStats: {
			averageOrderValue: { type: Number, default: 0 },
			minOrderValue: { type: Number, default: 0 },
			maxOrderValue: { type: Number, default: 0 },
		},
		// Time preferences (hour of day when user typically orders)
		timePreferences: [
			{
				hour: { type: Number, min: 0, max: 23 }, // 0-23
				orderCount: { type: Number, default: 0 },
			},
		],
		// Day of week preferences
		dayPreferences: [
			{
				dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday, 6=Saturday
				orderCount: { type: Number, default: 0 },
			},
		],
		// Total orders placed by user
		totalOrders: {
			type: Number,
			default: 0,
		},
		// Last time preferences were updated
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

// Indexes for fast lookups
userPreferencesSchema.index({ user: 1 });
userPreferencesSchema.index({ lastUpdated: 1 });

export default mongoose.model("UserPreferences", userPreferencesSchema);
