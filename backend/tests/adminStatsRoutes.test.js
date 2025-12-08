import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock the middleware and controllers using ESM-compatible mocking
jest.unstable_mockModule("../api/middleware/authMiddleware.js", () => ({
    verifyToken: jest.fn((req, res, next) => {
        req.user = { id: "testUserId", role: "admin" };
        next();
    }),
}));

jest.unstable_mockModule("../api/middleware/roleMiddleware.js", () => ({
    allowRoles: jest.fn(() => (req, res, next) => next()),
}));

jest.unstable_mockModule("../api/controllers/adminController.js", () => ({
    getAdminStats: jest.fn((req, res) => res.json({ success: true })),
}));

jest.unstable_mockModule("../api/controllers/adminStatsController.js", () => ({
    getItemsSoldStats: jest.fn((req, res) =>
        res.json({
            totalOrders: 10,
            totalItemsSold: 50,
            totalRevenue: 500,
            items: [],
        })
    ),
    getTimeSeriesStats: jest.fn((req, res) =>
        res.json({
            dailyStats: [
                { date: "2025-12-01", orders: 5, revenue: 100, itemsSold: 10 },
            ],
        })
    ),
    getProductTrends: jest.fn((req, res) =>
        res.json({
            products: [{ id: "1", name: "Latte", totalQuantity: 20, data: [] }],
            dateRange: ["2025-12-01"],
        })
    ),
}));

// Import router after mocking
const { default: adminRoutes } = await import("../api/routes/adminRoutes.js");

describe("Admin Stats Routes", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/api/admin", adminRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ═══════════════════════════════════════════════════════════════
    // /api/admin/stats/items-sold
    // ═══════════════════════════════════════════════════════════════
    describe("GET /api/admin/stats/items-sold", () => {
        it("✅ should return items sold stats", async () => {
            const response = await request(app)
                .get("/api/admin/stats/items-sold")
                .expect(200);

            expect(response.body).toHaveProperty("totalOrders");
            expect(response.body).toHaveProperty("totalItemsSold");
            expect(response.body).toHaveProperty("totalRevenue");
            expect(response.body).toHaveProperty("items");
        });

        it("✅ should be accessible at correct endpoint", async () => {
            await request(app).get("/api/admin/stats/items-sold").expect(200);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // /api/admin/stats/time-series
    // ═══════════════════════════════════════════════════════════════
    describe("GET /api/admin/stats/time-series", () => {
        it("✅ should return time series stats", async () => {
            const response = await request(app)
                .get("/api/admin/stats/time-series")
                .expect(200);

            expect(response.body).toHaveProperty("dailyStats");
            expect(Array.isArray(response.body.dailyStats)).toBe(true);
        });

        it("✅ should accept days query parameter", async () => {
            await request(app)
                .get("/api/admin/stats/time-series?days=7")
                .expect(200);
        });

        it("✅ should work with different day values", async () => {
            await request(app)
                .get("/api/admin/stats/time-series?days=14")
                .expect(200);
            await request(app)
                .get("/api/admin/stats/time-series?days=30")
                .expect(200);
            await request(app)
                .get("/api/admin/stats/time-series?days=90")
                .expect(200);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // /api/admin/stats/product-trends
    // ═══════════════════════════════════════════════════════════════
    describe("GET /api/admin/stats/product-trends", () => {
        it("✅ should return product trends", async () => {
            const response = await request(app)
                .get("/api/admin/stats/product-trends")
                .expect(200);

            expect(response.body).toHaveProperty("products");
            expect(response.body).toHaveProperty("dateRange");
        });

        it("✅ should accept days and top query parameters", async () => {
            await request(app)
                .get("/api/admin/stats/product-trends?days=7&top=5")
                .expect(200);
        });

        it("✅ should work with different top values", async () => {
            await request(app)
                .get("/api/admin/stats/product-trends?top=3")
                .expect(200);
            await request(app)
                .get("/api/admin/stats/product-trends?top=10")
                .expect(200);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // /api/admin/ping (health check)
    // ═══════════════════════════════════════════════════════════════
    describe("GET /api/admin/ping", () => {
        it("✅ should return ping response", async () => {
            const response = await request(app).get("/api/admin/ping").expect(200);
            expect(response.text).toBe("Admin route is live!");
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Invalid routes
    // ═══════════════════════════════════════════════════════════════
    describe("Invalid routes", () => {
        it("❌ should return 404 for unknown routes", async () => {
            await request(app).get("/api/admin/unknown-route").expect(404);
        });
    });
});
