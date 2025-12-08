/**
 * ML Helper Functions for Recommendation System
 * Provides utility functions for similarity calculations, feature extraction, and scoring
 */

/**
 * Calculate Jaccard similarity between two sets
 * Used for collaborative filtering (user-user similarity)
 * @param {Array} setA - First set of items
 * @param {Array} setB - Second set of items
 * @returns {number} Similarity score between 0 and 1
 */
export function jaccardSimilarity(setA, setB) {
	if (!setA || !setB || setA.length === 0 || setB.length === 0) {
		return 0;
	}

	// Convert to string for comparison
	const a = new Set(setA.map((item) => item.toString()));
	const b = new Set(setB.map((item) => item.toString()));

	// Calculate intersection
	const intersection = new Set([...a].filter((x) => b.has(x)));

	// Calculate union
	const union = new Set([...a, ...b]);

	// Jaccard = |intersection| / |union|
	return intersection.size / union.size;
}

/**
 * Calculate cosine similarity between two vectors
 * Used for content-based filtering (item-item similarity)
 * @param {Array<number>} vectorA - First vector
 * @param {Array<number>} vectorB - Second vector
 * @returns {number} Similarity score between 0 and 1
 */
export function cosineSimilarity(vectorA, vectorB) {
	if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
		return 0;
	}

	let dotProduct = 0;
	let magnitudeA = 0;
	let magnitudeB = 0;

	for (let i = 0; i < vectorA.length; i++) {
		dotProduct += vectorA[i] * vectorB[i];
		magnitudeA += vectorA[i] * vectorA[i];
		magnitudeB += vectorB[i] * vectorB[i];
	}

	magnitudeA = Math.sqrt(magnitudeA);
	magnitudeB = Math.sqrt(magnitudeB);

	if (magnitudeA === 0 || magnitudeB === 0) {
		return 0;
	}

	// Cosine similarity ranges from -1 to 1, normalize to 0 to 1
	const similarity = dotProduct / (magnitudeA * magnitudeB);
	return (similarity + 1) / 2; // Normalize to 0-1 range
}

/**
 * Extract feature vector from a menu item for content-based filtering
 * @param {Object} item - Menu item object
 * @param {Array} allCategories - All possible categories
 * @param {Array} allItemGroups - All possible item groups
 * @returns {Array<number>} Feature vector
 */
export function extractItemFeatures(item, allCategories, allItemGroups) {
	const features = [];

	// Price (normalized to 0-1 range, assuming max price of 50)
	features.push(Math.min(item.price / 50, 1));

	// Category one-hot encoding
	allCategories.forEach((cat) => {
		features.push(item.category === cat ? 1 : 0);
	});

	// Item group one-hot encoding
	allItemGroups.forEach((group) => {
		features.push(item.itemGroup === group ? 1 : 0);
	});

	// Availability
	features.push(item.available ? 1 : 0);

	// Prep time (if available, normalized to 0-1 range, assuming max 60 minutes)
	if (item.prepTime !== undefined) {
		features.push(Math.min(item.prepTime / 60, 1));
	} else {
		features.push(0.5); // Default middle value
	}

	return features;
}

/**
 * Normalize a score to 0-1 range
 * @param {number} score - Raw score
 * @param {number} min - Minimum possible value
 * @param {number} max - Maximum possible value
 * @returns {number} Normalized score
 */
export function normalizeScore(score, min, max) {
	if (max === min) return 0.5;
	return Math.max(0, Math.min(1, (score - min) / (max - min)));
}

/**
 * Calculate weighted score from multiple signals
 * @param {Object} scores - Object with score components
 * @param {Object} weights - Object with weight for each component
 * @returns {number} Weighted final score
 */
export function weightedScore(scores, weights) {
	let totalScore = 0;
	let totalWeight = 0;

	for (const key in scores) {
		if (weights[key] !== undefined) {
			totalScore += scores[key] * weights[key];
			totalWeight += weights[key];
		}
	}

	return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Get time-based context (breakfast, lunch, dinner, late night)
 * @param {number} hour - Hour of day (0-23)
 * @returns {string} Time context
 */
export function getTimeContext(hour) {
	if (hour >= 6 && hour < 11) return "breakfast";
	if (hour >= 11 && hour < 15) return "lunch";
	if (hour >= 15 && hour < 21) return "dinner";
	return "late_night";
}

/**
 * Calculate temporal similarity between two time periods
 * @param {number} hour1 - First hour (0-23)
 * @param {number} hour2 - Second hour (0-23)
 * @returns {number} Similarity score (0-1)
 */
export function temporalSimilarity(hour1, hour2) {
	// Calculate circular distance (hours wrap around)
	const diff = Math.abs(hour1 - hour2);
	const circularDiff = Math.min(diff, 24 - diff);

	// Convert to similarity (closer hours = higher similarity)
	// Max difference is 12 hours
	return 1 - circularDiff / 12;
}

/**
 * Calculate day of week similarity
 * @param {number} day1 - First day (0-6, 0=Sunday)
 * @param {number} day2 - Second day (0-6)
 * @returns {number} Similarity score (0-1)
 */
export function dayOfWeekSimilarity(day1, day2) {
	// Weekdays (Mon-Fri) are similar to each other
	// Weekends (Sat-Sun) are similar to each other
	const isWeekday1 = day1 >= 1 && day1 <= 5;
	const isWeekday2 = day2 >= 1 && day2 <= 5;

	if (day1 === day2) return 1.0;
	if (isWeekday1 === isWeekday2) return 0.7; // Same type (both weekday or both weekend)
	return 0.3; // Different type
}

/**
 * Diversify recommendations to avoid too many similar items
 * @param {Array} items - Array of recommended items with scores
 * @param {number} maxPerCategory - Maximum items per category
 * @returns {Array} Diversified items
 */
export function diversifyRecommendations(items, maxPerCategory = 3) {
	const categoryCounts = {};
	const diversified = [];

	for (const item of items) {
		const category = item.category || "other";

		if (!categoryCounts[category]) {
			categoryCounts[category] = 0;
		}

		if (categoryCounts[category] < maxPerCategory) {
			diversified.push(item);
			categoryCounts[category]++;
		}
	}

	return diversified;
}

/**
 * Add exploration items (items user hasn't tried) to recommendations
 * @param {Array} recommendations - Current recommendations
 * @param {Array} allItems - All available items
 * @param {Array} userOrderedItemIds - Items user has already ordered
 * @param {number} explorationRate - Percentage of exploration items (0-1)
 * @returns {Array} Recommendations with exploration items
 */
export function addExplorationItems(
	recommendations,
	allItems,
	userOrderedItemIds,
	explorationRate = 0.2
) {
	const userOrderedSet = new Set(userOrderedItemIds.map((id) => id.toString()));

	// Filter items user hasn't tried
	const unexploredItems = allItems.filter(
		(item) => !userOrderedSet.has(item._id.toString())
	);

	// Calculate how many exploration items to add
	const explorationCount = Math.ceil(recommendations.length * explorationRate);

	// Randomly select exploration items
	const shuffled = unexploredItems.sort(() => Math.random() - 0.5);
	const explorationItems = shuffled.slice(0, explorationCount).map((item) => ({
		...item.toObject(),
		score: 0.5, // Medium score for exploration
		reason: "New item to try",
		isExploration: true,
	}));

	// Merge and re-sort
	const merged = [...recommendations.slice(0, -explorationCount), ...explorationItems];

	return merged.sort((a, b) => b.score - a.score);
}

/**
 * Filter items by budget constraint
 * @param {Array} items - Array of items
 * @param {number} budget - Maximum budget
 * @returns {Array} Filtered items
 */
export function filterByBudget(items, budget) {
	return items.filter((item) => item.price <= budget);
}

/**
 * Filter items by time constraint
 * @param {Array} items - Array of items
 * @param {number} timeAvailable - Maximum time available (minutes)
 * @returns {Array} Filtered items
 */
export function filterByTime(items, timeAvailable) {
	return items.filter(
		(item) => !item.prepTime || item.prepTime <= timeAvailable
	);
}

/**
 * Calculate item popularity score based on order counts
 * @param {Object} orderCounts - Object mapping item IDs to order counts
 * @param {string} itemId - Item ID to get popularity for
 * @returns {number} Normalized popularity score (0-1)
 */
export function getPopularityScore(orderCounts, itemId, maxCount = null) {
	const count = orderCounts[itemId.toString()] || 0;

	if (maxCount === null) {
		// Find max count
		maxCount = Math.max(...Object.values(orderCounts), 1);
	}

	return count / maxCount;
}
