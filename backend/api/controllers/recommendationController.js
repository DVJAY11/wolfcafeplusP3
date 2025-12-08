import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import {
	getHybridRecommendations,
	getSimilarItems,
	buildUserProfile,
} from "../services/recommendationService.js";

// GET /api/recommend/smart-suggestions
export const getSmartSuggestions = async (req, res) => {
	try {
		const { budget, timeAvailable } = req.query;

		// Validate query parameters
		if (!budget || !timeAvailable) {
			return res.status(400).json({
				message: "Both budget and timeAvailable parameters are required"
			});
		}

		const budgetNum = parseFloat(budget);
		const timeNum = parseInt(timeAvailable);

		if (isNaN(budgetNum) || budgetNum <= 0) {
			return res.status(400).json({ message: "Budget must be a positive number" });
		}

		if (isNaN(timeNum) || timeNum <= 0) {
			return res.status(400).json({ message: "Time available must be a positive number" });
		}

		// Find items matching budget and time constraints
		const matchingItems = await MenuItem.find({
			available: true,
			price: { $lte: budgetNum },
			prepTime: { $lte: timeNum }
		});

		// Calculate popularity (order count) for each item
		const orders = await Order.find({});
		const orderCounts = {};

		orders.forEach(order => {
			order.items.forEach(item => {
				const menuItemId = item.menuItem.toString();
				orderCounts[menuItemId] = (orderCounts[menuItemId] || 0) + item.quantity;
			});
		});

		// Add popularity data and reason tags to items
		const itemsWithPopularity = matchingItems.map(item => {
			const itemObj = item.toObject();
			itemObj.orderCount = orderCounts[item._id.toString()] || 0;

			// Add reason tags
			const reasons = [];
			if (itemObj.price <= budgetNum * 0.5) {
				reasons.push("Great Value");
			} else if (itemObj.price <= budgetNum) {
				reasons.push("Under Budget");
			}

			if (itemObj.prepTime <= 10) {
				reasons.push("Quick Prep");
			} else if (itemObj.prepTime <= timeNum) {
				reasons.push("Ready in Time");
			}

			itemObj.reasons = reasons;
			return itemObj;
		});

		// Sort by popularity (order count) descending, then by price ascending
		const sortedItems = itemsWithPopularity.sort((a, b) => {
			if (b.orderCount !== a.orderCount) {
				return b.orderCount - a.orderCount;
			}
			return a.price - b.price;
		});

		// Return top 5-10 items
		const suggestions = sortedItems.slice(0, 10);

		res.status(200).json({
			count: suggestions.length,
			budget: budgetNum,
			timeAvailable: timeNum,
			suggestions
		});
	} catch (err) {
		console.error("Error in getSmartSuggestions:", err);
		res.status(500).json({ message: err.message });
	}
};

// GET /api/recommend/personalized
// ML-powered personalized recommendations
export const getPersonalizedRecommendations = async (req, res) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const { budget, timeAvailable, limit } = req.query;

		// Validate query parameters
		if (!budget || !timeAvailable) {
			return res.status(400).json({
				message: "Both budget and timeAvailable parameters are required"
			});
		}

		const budgetNum = parseFloat(budget);
		const timeNum = parseInt(timeAvailable);
		const limitNum = limit ? parseInt(limit) : 10;

		if (isNaN(budgetNum) || budgetNum <= 0) {
			return res.status(400).json({ message: "Budget must be a positive number" });
		}

		if (isNaN(timeNum) || timeNum <= 0) {
			return res.status(400).json({ message: "Time available must be a positive number" });
		}

		// Get hybrid ML recommendations
		const recommendations = await getHybridRecommendations(
			userId,
			budgetNum,
			timeNum,
			limitNum
		);

		res.status(200).json({
			count: recommendations.length,
			budget: budgetNum,
			timeAvailable: timeNum,
			userId,
			recommendations,
		});
	} catch (err) {
		console.error("Error in getPersonalizedRecommendations:", err);
		res.status(500).json({ message: err.message });
	}
};

// GET /api/recommend/similar-items/:itemId
// Find items similar to a given item
export const getSimilarItemsController = async (req, res) => {
	try {
		const { itemId } = req.params;
		const { limit } = req.query;

		if (!itemId) {
			return res.status(400).json({ message: "Item ID is required" });
		}

		const limitNum = limit ? parseInt(limit) : 5;

		const similarItems = await getSimilarItems(itemId, limitNum);

		res.status(200).json({
			count: similarItems.length,
			itemId,
			similarItems,
		});
	} catch (err) {
		console.error("Error in getSimilarItemsController:", err);
		res.status(500).json({ message: err.message });
	}
};

// POST /api/recommend/update-preferences
// Manually trigger user preference profile update
export const updateUserPreferences = async (req, res) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		// Build/update user profile
		const preferences = await buildUserProfile(userId);

		if (!preferences) {
			return res.status(200).json({
				message: "No order history found. Preferences will be built after first order.",
				preferences: null,
			});
		}

		res.status(200).json({
			message: "User preferences updated successfully",
			preferences,
		});
	} catch (err) {
		console.error("Error in updateUserPreferences:", err);
		res.status(500).json({ message: err.message });
	}
};

