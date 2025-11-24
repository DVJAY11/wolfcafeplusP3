import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./api/models/MenuItem.js";

dotenv.config();

// Seed prepTime values for existing menu items
const seedPrepTime = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB");

		// Find all menu items without prepTime or with default prepTime
		const items = await MenuItem.find();

		if (items.length === 0) {
			console.log("No menu items found to seed");
			process.exit(0);
		}

		console.log(`Found ${items.length} menu items to update`);

		// Assign realistic prepTime values based on category
		for (const item of items) {
			let prepTime;

			// Assign prepTime based on category or item name
			if (item.category?.toLowerCase().includes("coffee") ||
				item.category?.toLowerCase().includes("drink") ||
				item.category?.toLowerCase().includes("beverage")) {
				prepTime = Math.floor(Math.random() * 5) + 3; // 3-7 mins for drinks
			} else if (item.category?.toLowerCase().includes("snack") ||
				item.category?.toLowerCase().includes("dessert")) {
				prepTime = Math.floor(Math.random() * 8) + 5; // 5-12 mins for snacks
			} else if (item.category?.toLowerCase().includes("sandwich") ||
				item.category?.toLowerCase().includes("salad")) {
				prepTime = Math.floor(Math.random() * 8) + 10; // 10-17 mins
			} else if (item.category?.toLowerCase().includes("burger") ||
				item.category?.toLowerCase().includes("pizza")) {
				prepTime = Math.floor(Math.random() * 10) + 15; // 15-24 mins
			} else if (item.category?.toLowerCase().includes("pasta") ||
				item.category?.toLowerCase().includes("entree") ||
				item.category?.toLowerCase().includes("main")) {
				prepTime = Math.floor(Math.random() * 15) + 20; // 20-34 mins
			} else {
				// Default: random between 5-30 mins
				prepTime = Math.floor(Math.random() * 26) + 5;
			}

			item.prepTime = prepTime;
			await item.save();
			console.log(`Updated ${item.name}: prepTime = ${prepTime} mins`);
		}

		console.log("✅ Successfully seeded prepTime values for all menu items");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding prepTime:", error);
		process.exit(1);
	}
};

seedPrepTime();
