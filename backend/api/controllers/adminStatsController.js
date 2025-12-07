// ES module style (matches your project)
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/admin/stats/items-sold
// returns: { totalOrders, totalRevenue, items: [{ menuItemId, name, soldQuantity, revenue }], topN }
export const getItemsSoldStats = async (req, res) => {
    try {
        // Get the actual collection name from Mongoose model
        const menuItemCollectionName = MenuItem.collection.collectionName;

        // aggregate across orders -> items array
        const pipeline = [
            { $match: { status: { $ne: "pending" } } }, // only count non-pending orders
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.menuItem",
                    soldQuantity: { $sum: "$items.quantity" }
                }
            },
            // Convert _id to ObjectId if it's stored as string
            {
                $addFields: {
                    menuItemObjectId: { $toObjectId: "$_id" }
                }
            },
            // safer revenue calc: lookup MenuItem price and use that
            {
                $lookup: {
                    from: menuItemCollectionName,
                    localField: "menuItemObjectId",
                    foreignField: "_id",
                    as: "menu"
                }
            },
            {
                $unwind: { path: "$menu", preserveNullAndEmptyArrays: true }
            },
            // compute revenue: soldQuantity * menu.price (fallback to 0 if missing)
            {
                $addFields: {
                    revenue: { $multiply: [{ $ifNull: ["$soldQuantity", 0] }, { $ifNull: ["$menu.price", 0] }] },
                    name: { $ifNull: ["$menu.name", "Deleted Item"] }
                }
            },
            { $project: { _id: 0, menuItemId: "$_id", name: 1, soldQuantity: 1, revenue: 1 } },
            { $sort: { soldQuantity: -1 } }
        ];

        const items = await Order.aggregate(pipeline);

        // totals
        const totals = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    totalOrders: { $addToSet: "$_id" }, // set of order ids
                    totalQty: { $sum: "$items.quantity" }
                }
            },
            {
                $project: {
                    totalOrders: { $size: "$totalOrders" },
                    totalQty: 1
                }
            }
        ]);

        // compute total revenue from items using menu lookup (simple approach)
        const totalRevenue = items.reduce((s, it) => s + (it.revenue || 0), 0);

        res.json({
            totalOrders: (totals[0] && totals[0].totalOrders) || 0,
            totalItemsSold: (totals[0] && totals[0].totalQty) || 0,
            totalRevenue,
            items
        });
    } catch (err) {
        console.error("admin stats error:", err);
        res.status(500).json({ message: "Failed to compute stats", error: err.message });
    }
};

// GET /api/admin/stats/time-series
// returns: { dailyStats: [{ date, orders, revenue, itemsSold }] }
export const getTimeSeriesStats = async (req, res) => {
    try {
        // Get the number of days from query param, default to 30
        const days = parseInt(req.query.days) || 30;

        // Use UTC dates to avoid timezone issues
        const now = new Date();
        const startDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - days,
            0, 0, 0, 0
        ));

        // Aggregate orders by day
        const dailyStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $ne: "pending" }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$total" },
                    itemsSold: { $sum: { $size: "$items" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    orders: 1,
                    revenue: { $ifNull: ["$revenue", 0] },
                    itemsSold: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Fill in missing dates with zero values (using UTC)
        const filledStats = [];
        const currentDate = new Date(startDate);
        const today = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23, 59, 59, 999
        ));

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existingStat = dailyStats.find(s =>
                s.date && s.date.toISOString().split('T')[0] === dateStr
            );

            filledStats.push({
                date: dateStr,
                orders: existingStat?.orders || 0,
                revenue: existingStat?.revenue || 0,
                itemsSold: existingStat?.itemsSold || 0
            });

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        res.json({ dailyStats: filledStats });
    } catch (err) {
        console.error("time series stats error:", err);
        res.status(500).json({ message: "Failed to compute time series stats", error: err.message });
    }
};

// GET /api/admin/stats/product-trends
// returns: { products: [{ name, data: [{ date, quantity }] }] }
export const getProductTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const topN = parseInt(req.query.top) || 5; // Top N products to show

        // Use UTC dates to avoid timezone issues
        const now = new Date();
        const startDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - days,
            0, 0, 0, 0
        ));

        const menuItemCollectionName = MenuItem.collection.collectionName;

        // First, get top N products by total quantity in this period
        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $ne: "pending" }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.menuItem",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: topN },
            {
                $addFields: {
                    menuItemObjectId: { $toObjectId: "$_id" }
                }
            },
            {
                $lookup: {
                    from: menuItemCollectionName,
                    localField: "menuItemObjectId",
                    foreignField: "_id",
                    as: "menu"
                }
            },
            {
                $unwind: { path: "$menu", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    name: { $ifNull: ["$menu.name", "Deleted Item"] },
                    totalQuantity: 1
                }
            }
        ]);

        // Get the list of top product IDs as strings for comparison
        const topProductIds = topProducts.map(p => String(p._id));

        // Get ALL daily data (we'll filter in JS)
        const allProductTrends = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $ne: "pending" }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: {
                        menuItem: "$items.menuItem",
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    quantity: { $sum: "$items.quantity" }
                }
            },
            {
                $project: {
                    _id: 0,
                    menuItem: "$_id.menuItem",
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    quantity: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Filter to only include top products (compare as strings)
        const productTrends = allProductTrends.filter(pt =>
            topProductIds.includes(String(pt.menuItem))
        );

        // Generate date range (using UTC)
        const dateRange = [];
        const currentDate = new Date(startDate);
        const today = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23, 59, 59, 999
        ));
        while (currentDate <= today) {
            dateRange.push(currentDate.toISOString().split('T')[0]);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        // Structure data for frontend - each product has data for all dates
        const products = topProducts.map(product => {
            const productIdStr = String(product._id);
            const productData = dateRange.map(dateStr => {
                const match = productTrends.find(pt =>
                    String(pt.menuItem) === productIdStr &&
                    pt.date && pt.date.toISOString().split('T')[0] === dateStr
                );
                return {
                    date: dateStr,
                    quantity: match?.quantity || 0
                };
            });

            return {
                id: product._id,
                name: product.name,
                totalQuantity: product.totalQuantity,
                data: productData
            };
        });

        res.json({ products, dateRange });
    } catch (err) {
        console.error("product trends error:", err);
        res.status(500).json({ message: "Failed to compute product trends", error: err.message });
    }
};
