import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			enum: ["base", "topping", "flavoring", "protein", "vegetable", "bread", "dairy", "other"],
			required: true,
		},
		applicableFor: [
			{
				type: String,
				enum: ["drink", "main", "side"],
			},
		],
		allergens: [
			{
				type: String,
				enum: ["dairy", "nuts", "gluten", "soy", "eggs", "shellfish", "fish"],
			},
		],
		dietaryTags: [
			{
				type: String,
				enum: ["vegan", "vegetarian", "keto", "gluten-free", "dairy-free", "nut-free"],
			},
		],
		available: {
			type: Boolean,
			default: true,
		},
		image: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Ingredient", ingredientSchema);
