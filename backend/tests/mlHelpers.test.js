/**
 * Tests for ML helper utility functions
 */
import { describe, it, expect } from "@jest/globals";
import {
	jaccardSimilarity,
	cosineSimilarity,
	extractItemFeatures,
	normalizeScore,
	weightedScore,
	getTimeContext,
	temporalSimilarity,
	dayOfWeekSimilarity,
	diversifyRecommendations,
	addExplorationItems,
	filterByBudget,
	filterByTime,
	getPopularityScore,
} from "../api/utils/mlHelpers.js";

describe("🧮 ML Helpers", () => {
	// ================== JACCARD SIMILARITY ==================
	describe("jaccardSimilarity", () => {
		it("returns 1 for identical sets", () => {
			const setA = ["a", "b", "c"];
			const setB = ["a", "b", "c"];
			expect(jaccardSimilarity(setA, setB)).toBe(1);
		});

		it("returns 0 for completely different sets", () => {
			const setA = ["a", "b"];
			const setB = ["c", "d"];
			expect(jaccardSimilarity(setA, setB)).toBe(0);
		});

		it("returns 0.5 for half overlapping sets", () => {
			const setA = ["a", "b"];
			const setB = ["b", "c"];
			// intersection: {b}, union: {a, b, c}
			// 1/3 ≈ 0.333
			expect(jaccardSimilarity(setA, setB)).toBeCloseTo(0.333, 2);
		});

		it("returns 0 for empty sets", () => {
			expect(jaccardSimilarity([], [])).toBe(0);
			expect(jaccardSimilarity([], ["a"])).toBe(0);
			expect(jaccardSimilarity(["a"], [])).toBe(0);
		});

		it("handles null/undefined inputs", () => {
			expect(jaccardSimilarity(null, ["a"])).toBe(0);
			expect(jaccardSimilarity(["a"], null)).toBe(0);
			expect(jaccardSimilarity(undefined, undefined)).toBe(0);
		});
	});

	// ================== COSINE SIMILARITY ==================
	describe("cosineSimilarity", () => {
		it("returns 1 for identical vectors (normalized to 0-1)", () => {
			const vecA = [1, 0, 1];
			const vecB = [1, 0, 1];
			expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1, 5);
		});

		it("returns 0 for zero vectors", () => {
			const vecA = [0, 0, 0];
			const vecB = [1, 1, 1];
			expect(cosineSimilarity(vecA, vecB)).toBe(0);
		});

		it("returns 0 for vectors of different lengths", () => {
			const vecA = [1, 2];
			const vecB = [1, 2, 3];
			expect(cosineSimilarity(vecA, vecB)).toBe(0);
		});

		it("handles null/undefined inputs", () => {
			expect(cosineSimilarity(null, [1, 2])).toBe(0);
			expect(cosineSimilarity([1, 2], undefined)).toBe(0);
		});

		it("calculates similarity between different vectors", () => {
			const vecA = [1, 0, 0];
			const vecB = [0, 1, 0];
			// Orthogonal vectors have cosine 0, normalized to 0.5
			expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.5, 5);
		});
	});

	// ================== EXTRACT ITEM FEATURES ==================
	describe("extractItemFeatures", () => {
		const categories = ["coffee", "food", "dessert"];
		const itemGroups = ["drink", "main", "side"];

		it("extracts features for a basic item", () => {
			const item = { price: 5, category: "coffee", itemGroup: "drink", available: true, prepTime: 10 };
			const features = extractItemFeatures(item, categories, itemGroups);

			// Should have: 1 price + 3 categories + 3 itemGroups + 1 available + 1 prepTime = 9 features
			expect(features.length).toBe(9);
			expect(features[0]).toBeCloseTo(0.1, 2); // price/50
		});

		it("creates one-hot encoding for categories", () => {
			const item = { price: 10, category: "food", itemGroup: "main", available: true };
			const features = extractItemFeatures(item, categories, itemGroups);

			// Category one-hot: [coffee, food, dessert] → [0, 1, 0]
			expect(features[1]).toBe(0); // coffee
			expect(features[2]).toBe(1); // food
			expect(features[3]).toBe(0); // dessert
		});

		it("handles missing prepTime with default value", () => {
			const item = { price: 10, category: "coffee", itemGroup: "drink", available: true };
			const features = extractItemFeatures(item, categories, itemGroups);

			// Last feature should be 0.5 (default for missing prepTime)
			expect(features[features.length - 1]).toBe(0.5);
		});
	});

	// ================== NORMALIZE SCORE ==================
	describe("normalizeScore", () => {
		it("normalizes values to 0-1 range", () => {
			expect(normalizeScore(5, 0, 10)).toBe(0.5);
			expect(normalizeScore(0, 0, 10)).toBe(0);
			expect(normalizeScore(10, 0, 10)).toBe(1);
		});

		it("returns 0.5 when min equals max", () => {
			expect(normalizeScore(5, 5, 5)).toBe(0.5);
		});

		it("clamps values outside range", () => {
			expect(normalizeScore(-5, 0, 10)).toBe(0);
			expect(normalizeScore(15, 0, 10)).toBe(1);
		});
	});

	// ================== WEIGHTED SCORE ==================
	describe("weightedScore", () => {
		it("calculates weighted average", () => {
			const scores = { a: 0.8, b: 0.6 };
			const weights = { a: 0.5, b: 0.5 };
			expect(weightedScore(scores, weights)).toBeCloseTo(0.7, 2);
		});

		it("ignores scores without weights", () => {
			const scores = { a: 0.8, b: 0.6, c: 1.0 };
			const weights = { a: 0.5, b: 0.5 };
			// c should be ignored
			expect(weightedScore(scores, weights)).toBeCloseTo(0.7, 2);
		});

		it("returns 0 when all weights are 0", () => {
			const scores = { a: 0.8 };
			const weights = {};
			expect(weightedScore(scores, weights)).toBe(0);
		});
	});

	// ================== GET TIME CONTEXT ==================
	describe("getTimeContext", () => {
		it("returns breakfast for morning hours", () => {
			expect(getTimeContext(7)).toBe("breakfast");
			expect(getTimeContext(10)).toBe("breakfast");
		});

		it("returns lunch for midday hours", () => {
			expect(getTimeContext(12)).toBe("lunch");
			expect(getTimeContext(14)).toBe("lunch");
		});

		it("returns dinner for evening hours", () => {
			expect(getTimeContext(18)).toBe("dinner");
			expect(getTimeContext(20)).toBe("dinner");
		});

		it("returns late_night for night hours", () => {
			expect(getTimeContext(22)).toBe("late_night");
			expect(getTimeContext(2)).toBe("late_night");
		});
	});

	// ================== TEMPORAL SIMILARITY ==================
	describe("temporalSimilarity", () => {
		it("returns 1 for same hour", () => {
			expect(temporalSimilarity(10, 10)).toBe(1);
		});

		it("returns lower value for different hours", () => {
			expect(temporalSimilarity(10, 12)).toBeLessThan(1);
		});

		it("handles circular distance (hour wrap-around)", () => {
			// 23:00 and 1:00 are only 2 hours apart
			const similarity = temporalSimilarity(23, 1);
			expect(similarity).toBeGreaterThan(0.8);
		});
	});

	// ================== DAY OF WEEK SIMILARITY ==================
	describe("dayOfWeekSimilarity", () => {
		it("returns 1 for same day", () => {
			expect(dayOfWeekSimilarity(1, 1)).toBe(1); // Monday
		});

		it("returns 0.7 for weekdays", () => {
			expect(dayOfWeekSimilarity(1, 3)).toBe(0.7); // Monday and Wednesday
		});

		it("returns 0.7 for weekend days", () => {
			expect(dayOfWeekSimilarity(0, 6)).toBe(0.7); // Sunday and Saturday
		});

		it("returns 0.3 for weekday-weekend mix", () => {
			expect(dayOfWeekSimilarity(1, 0)).toBe(0.3); // Monday and Sunday
		});
	});

	// ================== DIVERSIFY RECOMMENDATIONS ==================
	describe("diversifyRecommendations", () => {
		it("limits items per category", () => {
			const items = [
				{ name: "A", category: "coffee" },
				{ name: "B", category: "coffee" },
				{ name: "C", category: "coffee" },
				{ name: "D", category: "coffee" },
			];
			const diversified = diversifyRecommendations(items, 2);
			expect(diversified.length).toBe(2);
		});

		it("keeps items from different categories", () => {
			const items = [
				{ name: "A", category: "coffee" },
				{ name: "B", category: "food" },
				{ name: "C", category: "coffee" },
			];
			const diversified = diversifyRecommendations(items, 2);
			expect(diversified.length).toBe(3);
		});

		it("handles items without category", () => {
			const items = [{ name: "A" }, { name: "B" }];
			const diversified = diversifyRecommendations(items, 1);
			expect(diversified.length).toBe(1);
		});
	});

	// ================== FILTER BY BUDGET ==================
	describe("filterByBudget", () => {
		it("filters items above budget", () => {
			const items = [
				{ name: "Cheap", price: 5 },
				{ name: "Expensive", price: 15 },
			];
			const filtered = filterByBudget(items, 10);
			expect(filtered.length).toBe(1);
			expect(filtered[0].name).toBe("Cheap");
		});

		it("includes items at exactly budget", () => {
			const items = [{ name: "Exact", price: 10 }];
			const filtered = filterByBudget(items, 10);
			expect(filtered.length).toBe(1);
		});
	});

	// ================== FILTER BY TIME ==================
	describe("filterByTime", () => {
		it("filters items exceeding time limit", () => {
			const items = [
				{ name: "Quick", prepTime: 5 },
				{ name: "Slow", prepTime: 30 },
			];
			const filtered = filterByTime(items, 15);
			expect(filtered.length).toBe(1);
			expect(filtered[0].name).toBe("Quick");
		});

		it("includes items without prepTime", () => {
			const items = [{ name: "Unknown" }];
			const filtered = filterByTime(items, 15);
			expect(filtered.length).toBe(1);
		});
	});

	// ================== GET POPULARITY SCORE ==================
	describe("getPopularityScore", () => {
		it("returns normalized popularity", () => {
			const counts = { item1: 10, item2: 5 };
			expect(getPopularityScore(counts, "item1")).toBe(1);
			expect(getPopularityScore(counts, "item2")).toBe(0.5);
		});

		it("returns 0 for items with no orders", () => {
			const counts = { item1: 10 };
			expect(getPopularityScore(counts, "item2")).toBe(0);
		});

		it("uses provided maxCount", () => {
			const counts = { item1: 5 };
			expect(getPopularityScore(counts, "item1", 10)).toBe(0.5);
		});
	});
});
