/**
 * ML-Based Recommendation Service
 * Provides personalized recommendations using collaborative filtering,
 * content-based filtering, and temporal pattern analysis
 */

import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import UserPreferences from "../models/UserPreferences.js";
import {
	jaccardSimilarity,
	cosineSimilarity,
	extractItemFeatures,
	weightedScore,
	getTimeContext,
	temporalSimilarity,
	dayOfWeekSimilarity,
	diversifyRecommendations,
	addExplorationItems,
	filterByBudget,
	filterByTime,
	getPopularityScore,
} from "../utils/mlHelpers.js";

/**
 * Build or update user preference profile from order history
 * @param {string} userId - User ID
 * @returns {Object} User preferences object
 */
export async function buildUserProfile(userId) {
	try {
		// Fetch all completed orders for the user
		const orders = await Order.find({
			user: userId,
			status: "completed",
		})
			.populate("items.menuItem")
			.sort({ createdAt: -1 })
			.limit(100); // Last 100 orders

		if (orders.length === 0) {
			// New user, return empty preferences
			return null;
		}

		// Initialize counters
		const categoryCount = {};
		const itemGroupCount = {};
		const itemCount = {};
		const timeCount = {};
		const dayCount = {};
		const dietaryTags = new Set();
		const avoidedAllergens = new Set();
		let totalSpent = 0;
		let minSpent = Infinity;
		let maxSpent = 0;

		// Analyze orders
		for (const order of orders) {
			// Budget stats
			if (order.total) {
				totalSpent += order.total;
				minSpent = Math.min(minSpent, order.total);
				maxSpent = Math.max(maxSpent, order.total);
			}

			// Time preferences
			if (order.orderTime !== undefined) {
				timeCount[order.orderTime] = (timeCount[order.orderTime] || 0) + 1;
			}

			// Day preferences
			if (order.dayOfWeek !== undefined) {
				dayCount[order.dayOfWeek] = (dayCount[order.dayOfWeek] || 0) + 1;
			}

			// Item analysis
			for (const orderItem of order.items) {
				if (!orderItem.menuItem) continue;

				const item = orderItem.menuItem;
				const itemId = item._id.toString();
				const quantity = orderItem.quantity || 1;

				// Category count
				if (item.category) {
					categoryCount[item.category] =
						(categoryCount[item.category] || 0) + quantity;
				}

				// Item group count
				if (item.itemGroup) {
					itemGroupCount[item.itemGroup] =
						(itemGroupCount[item.itemGroup] || 0) + quantity;
				}

				// Individual item count
				if (!itemCount[itemId]) {
					itemCount[itemId] = {
						menuItem: item._id,
						orderCount: 0,
						lastOrdered: order.createdAt,
					};
				}
				itemCount[itemId].orderCount += quantity;
				itemCount[itemId].lastOrdered = order.createdAt;
			}
		}

		// Convert to arrays and sort
		const favoriteCategories = Object.entries(categoryCount)
			.map(([category, orderCount]) => ({ category, orderCount }))
			.sort((a, b) => b.orderCount - a.orderCount);

		const favoriteItemGroups = Object.entries(itemGroupCount)
			.map(([itemGroup, orderCount]) => ({ itemGroup, orderCount }))
			.sort((a, b) => b.orderCount - a.orderCount);

		const favoriteItems = Object.values(itemCount)
			.sort((a, b) => b.orderCount - a.orderCount)
			.slice(0, 20); // Top 20 items

		const timePreferences = Object.entries(timeCount).map(([hour, orderCount]) => ({
			hour: parseInt(hour),
			orderCount,
		}));

		const dayPreferences = Object.entries(dayCount).map(
			([dayOfWeek, orderCount]) => ({
				dayOfWeek: parseInt(dayOfWeek),
				orderCount,
			})
		);

		// Create or update user preferences
		const preferences = await UserPreferences.findOneAndUpdate(
			{ user: userId },
			{
				user: userId,
				favoriteCategories,
				favoriteItemGroups,
				favoriteItems,
				dietaryPreferences: Array.from(dietaryTags),
				avoidedAllergens: Array.from(avoidedAllergens),
				budgetStats: {
					averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
					minOrderValue: minSpent === Infinity ? 0 : minSpent,
					maxOrderValue: maxSpent,
				},
				timePreferences,
				dayPreferences,
				totalOrders: orders.length,
				lastUpdated: new Date(),
			},
			{ upsert: true, new: true }
		);

		return preferences;
	} catch (error) {
		console.error("Error building user profile:", error);
		throw error;
	}
}

/**
 * Get collaborative filtering recommendations (user-based)
 * Finds similar users and recommends items they liked
 * @param {string} userId - Target user ID
 * @param {Array} candidateItems - Items to score
 * @returns {Object} Item scores from collaborative filtering
 */
export async function collaborativeFiltering(userId, candidateItems) {
	try {
		// Get target user's order history
		const userOrders = await Order.find({
			user: userId,
			status: "completed",
		}).select("items.menuItem");

		const userItemIds = new Set();
		userOrders.forEach((order) => {
			order.items.forEach((item) => {
				if (item.menuItem) {
					userItemIds.add(item.menuItem.toString());
				}
			});
		});

		if (userItemIds.size === 0) {
			// No order history, return empty scores
			return {};
		}

		// Find other users and their order histories
		const allOrders = await Order.find({
			status: "completed",
			user: { $ne: userId },
		}).select("user items.menuItem");

		// Group orders by user
		const userOrderMap = {};
		allOrders.forEach((order) => {
			const otherUserId = order.user.toString();
			if (!userOrderMap[otherUserId]) {
				userOrderMap[otherUserId] = new Set();
			}
			order.items.forEach((item) => {
				if (item.menuItem) {
					userOrderMap[otherUserId].add(item.menuItem.toString());
				}
			});
		});

		// Calculate user similarities
		const userSimilarities = [];
		for (const [otherUserId, otherItemIds] of Object.entries(userOrderMap)) {
			const similarity = jaccardSimilarity(
				Array.from(userItemIds),
				Array.from(otherItemIds)
			);

			if (similarity > 0.1) {
				// Only consider users with >10% similarity
				userSimilarities.push({
					userId: otherUserId,
					similarity,
					items: otherItemIds,
				});
			}
		}

		// Sort by similarity
		userSimilarities.sort((a, b) => b.similarity - a.similarity);

		// Take top 10 similar users
		const topSimilarUsers = userSimilarities.slice(0, 10);

		// Score items based on similar users
		const itemScores = {};
		for (const candidate of candidateItems) {
			const itemId = candidate._id.toString();

			// Skip items user has already ordered
			if (userItemIds.has(itemId)) {
				itemScores[itemId] = 0;
				continue;
			}

			let score = 0;
			let totalSimilarity = 0;

			for (const similarUser of topSimilarUsers) {
				if (similarUser.items.has(itemId)) {
					score += similarUser.similarity;
				}
				totalSimilarity += similarUser.similarity;
			}

			// Normalize by total similarity
			itemScores[itemId] = totalSimilarity > 0 ? score / totalSimilarity : 0;
		}

		return itemScores;
	} catch (error) {
		console.error("Error in collaborative filtering:", error);
		return {};
	}
}

/**
 * Get content-based filtering recommendations
 * Recommends items similar to user's past orders
 * @param {string} userId - Target user ID
 * @param {Array} candidateItems - Items to score
 * @returns {Object} Item scores from content-based filtering
 */
export async function contentBasedFiltering(userId, candidateItems) {
	try {
		// Get user's order history
		const userOrders = await Order.find({
			user: userId,
			status: "completed",
		})
			.populate("items.menuItem")
			.limit(50);

		if (userOrders.length === 0) {
			return {};
		}

		// Extract items user has ordered
		const orderedItems = [];
		const orderedItemIds = new Set();

		userOrders.forEach((order) => {
			order.items.forEach((item) => {
				if (item.menuItem && item.menuItem._id) {
					orderedItems.push(item.menuItem);
					orderedItemIds.add(item.menuItem._id.toString());
				}
			});
		});

		// Get all unique categories and item groups for feature extraction
		const allCategories = [...new Set(candidateItems.map((item) => item.category))];
		const allItemGroups = [...new Set(candidateItems.map((item) => item.itemGroup))];

		// Extract feature vectors for ordered items
		const orderedFeatures = orderedItems.map((item) =>
			extractItemFeatures(item, allCategories, allItemGroups)
		);

		// Calculate average feature vector (user profile)
		const userProfile = new Array(orderedFeatures[0]?.length || 0).fill(0);
		orderedFeatures.forEach((features) => {
			features.forEach((value, index) => {
				userProfile[index] += value;
			});
		});
		userProfile.forEach((_, index) => {
			userProfile[index] /= orderedFeatures.length;
		});

		// Score candidate items
		const itemScores = {};
		for (const candidate of candidateItems) {
			const itemId = candidate._id.toString();

			// Skip items user has already ordered
			if (orderedItemIds.has(itemId)) {
				itemScores[itemId] = 0;
				continue;
			}

			const candidateFeatures = extractItemFeatures(
				candidate,
				allCategories,
				allItemGroups
			);
			const similarity = cosineSimilarity(userProfile, candidateFeatures);

			itemScores[itemId] = similarity;
		}

		return itemScores;
	} catch (error) {
		console.error("Error in content-based filtering:", error);
		return {};
	}
}

/**
 * Get temporal pattern scores
 * Scores items based on time-of-day and day-of-week patterns
 * @param {string} userId - Target user ID
 * @param {number} currentHour - Current hour (0-23)
 * @param {number} currentDay - Current day of week (0-6)
 * @returns {number} Temporal score (0-1)
 */
export async function temporalPatternScore(userId, currentHour, currentDay) {
	try {
		const preferences = await UserPreferences.findOne({ user: userId });

		if (!preferences) {
			return 0.5; // Neutral score for new users
		}

		// Calculate time similarity
		let timeScore = 0;
		let totalTimeOrders = 0;

		preferences.timePreferences.forEach((timePref) => {
			const similarity = temporalSimilarity(currentHour, timePref.hour);
			timeScore += similarity * timePref.orderCount;
			totalTimeOrders += timePref.orderCount;
		});

		timeScore = totalTimeOrders > 0 ? timeScore / totalTimeOrders : 0.5;

		// Calculate day similarity
		let dayScore = 0;
		let totalDayOrders = 0;

		preferences.dayPreferences.forEach((dayPref) => {
			const similarity = dayOfWeekSimilarity(currentDay, dayPref.dayOfWeek);
			dayScore += similarity * dayPref.orderCount;
			totalDayOrders += dayPref.orderCount;
		});

		dayScore = totalDayOrders > 0 ? dayScore / totalDayOrders : 0.5;

		// Combine time and day scores
		return (timeScore * 0.6 + dayScore * 0.4);
	} catch (error) {
		console.error("Error in temporal pattern score:", error);
		return 0.5;
	}
}

/**
 * Get hybrid recommendations combining all signals
 * @param {string} userId - Target user ID
 * @param {number} budget - Maximum budget
 * @param {number} timeAvailable - Maximum time available (minutes)
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} Recommended items with scores and reasons
 */
export async function getHybridRecommendations(
	userId,
	budget,
	timeAvailable,
	limit = 10
) {
	try {
		// Get all available menu items
		let candidateItems = await MenuItem.find({ available: true });

		// Apply hard constraints
		candidateItems = filterByBudget(candidateItems, budget);
		candidateItems = filterByTime(candidateItems, timeAvailable);

		if (candidateItems.length === 0) {
			return [];
		}

		// Get current time context
		const now = new Date();
		const currentHour = now.getHours();
		const currentDay = now.getDay();

		// Calculate global popularity
		const allOrders = await Order.find({ status: "completed" });
		const orderCounts = {};
		allOrders.forEach((order) => {
			order.items.forEach((item) => {
				const itemId = item.menuItem.toString();
				orderCounts[itemId] = (orderCounts[itemId] || 0) + (item.quantity || 1);
			});
		});

		// Get scores from different algorithms
		const [collaborativeScores, contentScores, temporalScore] = await Promise.all([
			collaborativeFiltering(userId, candidateItems),
			contentBasedFiltering(userId, candidateItems),
			temporalPatternScore(userId, currentHour, currentDay),
		]);

		// Combine scores with weights
		const weights = {
			collaborative: 0.4,
			content: 0.3,
			temporal: 0.2,
			popularity: 0.1,
		};

		const scoredItems = candidateItems.map((item) => {
			const itemId = item._id.toString();

			const scores = {
				collaborative: collaborativeScores[itemId] || 0,
				content: contentScores[itemId] || 0,
				temporal: temporalScore,
				popularity: getPopularityScore(orderCounts, itemId),
			};

			const finalScore = weightedScore(scores, weights);

			// Generate reasons
			const reasons = [];
			if (scores.collaborative > 0.5) {
				reasons.push("Popular with similar users");
			}
			if (scores.content > 0.5) {
				reasons.push("Matches your preferences");
			}
			if (scores.popularity > 0.7) {
				reasons.push("Customer favorite");
			}
			if (item.price <= budget * 0.5) {
				reasons.push("Great value");
			}
			if (item.prepTime && item.prepTime <= 10) {
				reasons.push("Quick prep");
			}

			return {
				...item.toObject(),
				score: finalScore,
				reasons: reasons.length > 0 ? reasons : ["Available now"],
				scoreBreakdown: scores, // For debugging
			};
		});

		// Sort by score
		scoredItems.sort((a, b) => b.score - a.score);

		// Apply diversity
		const diversified = diversifyRecommendations(scoredItems, 3);

		// Get user's ordered items for exploration
		const userOrders = await Order.find({
			user: userId,
			status: "completed",
		}).select("items.menuItem");

		const userOrderedItemIds = [];
		userOrders.forEach((order) => {
			order.items.forEach((item) => {
				if (item.menuItem) {
					userOrderedItemIds.push(item.menuItem);
				}
			});
		});

		// Add exploration items (20% of recommendations)
		const withExploration = addExplorationItems(
			diversified,
			candidateItems,
			userOrderedItemIds,
			0.2
		);

		// Return top N recommendations
		return withExploration.slice(0, limit);
	} catch (error) {
		console.error("Error in hybrid recommendations:", error);
		throw error;
	}
}

/**
 * Get similar items to a given item (for "You might also like")
 * @param {string} itemId - Target item ID
 * @param {number} limit - Number of similar items to return
 * @returns {Array} Similar items
 */
export async function getSimilarItems(itemId, limit = 5) {
	try {
		const targetItem = await MenuItem.findById(itemId);
		if (!targetItem) {
			return [];
		}

		// Get all available items except the target
		const candidateItems = await MenuItem.find({
			available: true,
			_id: { $ne: itemId },
		});

		// Get all unique categories and item groups
		const allItems = [targetItem, ...candidateItems];
		const allCategories = [...new Set(allItems.map((item) => item.category))];
		const allItemGroups = [...new Set(allItems.map((item) => item.itemGroup))];

		// Extract target item features
		const targetFeatures = extractItemFeatures(
			targetItem,
			allCategories,
			allItemGroups
		);

		// Score candidates by similarity
		const scoredItems = candidateItems.map((candidate) => {
			const candidateFeatures = extractItemFeatures(
				candidate,
				allCategories,
				allItemGroups
			);
			const similarity = cosineSimilarity(targetFeatures, candidateFeatures);

			return {
				...candidate.toObject(),
				similarity,
			};
		});

		// Sort by similarity
		scoredItems.sort((a, b) => b.similarity - a.similarity);

		return scoredItems.slice(0, limit);
	} catch (error) {
		console.error("Error getting similar items:", error);
		throw error;
	}
}
