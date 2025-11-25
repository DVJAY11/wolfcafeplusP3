import mongoose from "mongoose";

const customItemSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		baseItem: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MenuItem",
			default: null,
		},
		ingredients: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Ingredient",
			},
		],
		dietaryRestrictions: [
			{
				type: String,
				enum: ["vegan", "vegetarian", "keto", "gluten-free", "dairy-free", "nut-free"],
			},
		],
		totalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		savedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("CustomItem", customItemSchema);
