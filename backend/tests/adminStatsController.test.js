import { jest } from "@jest/globals";
import {
    getItemsSoldStats,
    getTimeSeriesStats,
    getProductTrends,
} from "../api/controllers/adminStatsController.js";
import Order from "../api/models/Order.js";
import MenuItem from "../api/models/MenuItem.js";

// --- create spies for model methods ---
jest.spyOn(Order, "aggregate");

// --- mock entire modules ---
jest.mock("../api/models/Order.js");
jest.mock("../api/models/MenuItem.js");

describe("AdminStatsController", () => {
    let req, res;

    beforeEach(() => {
        req = { query: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();

        // Mock MenuItem.collection.collectionName
        MenuItem.collection = { collectionName: "menuitems" };
    });

    // ═══════════════════════════════════════════════════════════════
    // getItemsSoldStats Tests
    // ═══════════════════════════════════════════════════════════════
    describe("getItemsSoldStats", () => {
        it("should return items sold stats with proper structure", async () => {
            const mockItems = [
                { menuItemId: "item1", name: "Latte", soldQuantity: 50, revenue: 250 },
                { menuItemId: "item2", name: "Espresso", soldQuantity: 30, revenue: 90 },
            ];
            const mockTotals = [{ totalOrders: 10, totalQty: 80 }];

            Order.aggregate
                .mockResolvedValueOnce(mockItems)
                .mockResolvedValueOnce(mockTotals);

            await getItemsSoldStats(req, res);

            expect(Order.aggregate).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith({
                totalOrders: 10,
                totalItemsSold: 80,
                totalRevenue: 340,
                items: mockItems,
            });
        });

        it("should handle empty orders (no sales)", async () => {
            Order.aggregate
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await getItemsSoldStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                totalOrders: 0,
                totalItemsSold: 0,
                totalRevenue: 0,
                items: [],
            });
        });

        it("should handle database errors gracefully", async () => {
            Order.aggregate.mockRejectedValue(new Error("DB connection failed"));

            await getItemsSoldStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to compute stats",
                error: "DB connection failed",
            });
        });

        it("should calculate total revenue from items array", async () => {
            const mockItems = [
                { menuItemId: "1", name: "A", soldQuantity: 10, revenue: 100 },
                { menuItemId: "2", name: "B", soldQuantity: 20, revenue: 200 },
                { menuItemId: "3", name: "C", soldQuantity: 5, revenue: 50 },
            ];

            Order.aggregate
                .mockResolvedValueOnce(mockItems)
                .mockResolvedValueOnce([{ totalOrders: 5, totalQty: 35 }]);

            await getItemsSoldStats(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalRevenue: 350,
                })
            );
        });

        it("should handle items with missing revenue", async () => {
            const mockItems = [
                { menuItemId: "1", name: "A", soldQuantity: 10, revenue: null },
                { menuItemId: "2", name: "B", soldQuantity: 20, revenue: undefined },
            ];

            Order.aggregate
                .mockResolvedValueOnce(mockItems)
                .mockResolvedValueOnce([{ totalOrders: 2, totalQty: 30 }]);

            await getItemsSoldStats(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalRevenue: 0,
                })
            );
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // getTimeSeriesStats Tests
    // ═══════════════════════════════════════════════════════════════
    describe("getTimeSeriesStats", () => {
        it("should return daily stats with default 30 days", async () => {
            const mockDailyStats = [
                { date: new Date("2025-12-01"), orders: 5, revenue: 100, itemsSold: 10 },
                { date: new Date("2025-12-02"), orders: 3, revenue: 75, itemsSold: 6 },
            ];

            Order.aggregate.mockResolvedValueOnce(mockDailyStats);

            await getTimeSeriesStats(req, res);

            expect(Order.aggregate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    dailyStats: expect.any(Array),
                })
            );
        });

        it("should use custom days parameter", async () => {
            req.query.days = "7";
            Order.aggregate.mockResolvedValueOnce([]);

            await getTimeSeriesStats(req, res);

            expect(Order.aggregate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it("should fill in missing dates with zero values", async () => {
            const today = new Date();
            const mockStats = [
                { date: today, orders: 2, revenue: 50, itemsSold: 4 },
            ];

            Order.aggregate.mockResolvedValueOnce(mockStats);
            req.query.days = "3";

            await getTimeSeriesStats(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.dailyStats.length).toBeGreaterThanOrEqual(3);
        });

        it("should handle aggregate errors", async () => {
            Order.aggregate.mockRejectedValue(new Error("Aggregate failed"));

            await getTimeSeriesStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to compute time series stats",
                error: "Aggregate failed",
            });
        });

        it("should handle empty result", async () => {
            Order.aggregate.mockResolvedValueOnce([]);
            req.query.days = "7";

            await getTimeSeriesStats(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.dailyStats).toBeDefined();
            response.dailyStats.forEach((day) => {
                expect(day.orders).toBe(0);
                expect(day.revenue).toBe(0);
                expect(day.itemsSold).toBe(0);
            });
        });

        it("should handle invalid days parameter", async () => {
            req.query.days = "invalid";
            Order.aggregate.mockResolvedValueOnce([]);

            await getTimeSeriesStats(req, res);

            expect(res.json).toHaveBeenCalled();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // getProductTrends Tests
    // ═══════════════════════════════════════════════════════════════
    describe("getProductTrends", () => {
        it("should return product trends with default params", async () => {
            const mockTopProducts = [
                { _id: "prod1", name: "Latte", totalQuantity: 100 },
                { _id: "prod2", name: "Espresso", totalQuantity: 80 },
            ];
            const mockTrends = [];

            Order.aggregate
                .mockResolvedValueOnce(mockTopProducts)
                .mockResolvedValueOnce(mockTrends);

            await getProductTrends(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    products: expect.any(Array),
                    dateRange: expect.any(Array),
                })
            );
        });

        it("should use custom top parameter", async () => {
            req.query.top = "3";
            const mockTopProducts = [
                { _id: "1", name: "A", totalQuantity: 50 },
                { _id: "2", name: "B", totalQuantity: 40 },
                { _id: "3", name: "C", totalQuantity: 30 },
            ];

            Order.aggregate
                .mockResolvedValueOnce(mockTopProducts)
                .mockResolvedValueOnce([]);

            await getProductTrends(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.products.length).toBe(3);
        });

        it("should handle no products in range", async () => {
            Order.aggregate
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            await getProductTrends(req, res);

            expect(res.json).toHaveBeenCalledWith({
                products: [],
                dateRange: expect.any(Array),
            });
        });

        it("should handle database errors", async () => {
            Order.aggregate.mockRejectedValue(new Error("Connection lost"));

            await getProductTrends(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Failed to compute product trends",
                error: "Connection lost",
            });
        });

        it("should return data array for each product covering all dates", async () => {
            req.query.days = "3";
            const mockTopProducts = [{ _id: "prod1", name: "Coffee", totalQuantity: 10 }];

            Order.aggregate
                .mockResolvedValueOnce(mockTopProducts)
                .mockResolvedValueOnce([]);

            await getProductTrends(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.products[0].data.length).toBeGreaterThanOrEqual(3);
        });

        it("should include product name and totalQuantity in response", async () => {
            const mockTopProducts = [
                { _id: "abc123", name: "Mocha", totalQuantity: 75 },
            ];

            Order.aggregate
                .mockResolvedValueOnce(mockTopProducts)
                .mockResolvedValueOnce([]);

            await getProductTrends(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.products[0]).toMatchObject({
                name: "Mocha",
                totalQuantity: 75,
            });
        });
    });
});
