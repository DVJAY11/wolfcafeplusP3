import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

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
