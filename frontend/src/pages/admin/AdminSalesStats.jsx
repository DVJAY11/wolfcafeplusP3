import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend,
    AreaChart,
    Area,
    LineChart,
    Line
} from "recharts";

// Color palette for the chart bars
const COLORS = ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a", "#0d9488", "#0891b2", "#0284c7", "#2563eb"];

export default function AdminSalesStats() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);
    const [productTrends, setProductTrends] = useState({ products: [], dateRange: [] });
    const [productTrendsLoading, setProductTrendsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [topProductsCount, setTopProductsCount] = useState(5);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await api.get("/admin/stats/items-sold");
                setStats(res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchTimeSeries = async () => {
            try {
                setTimeSeriesLoading(true);
                const res = await api.get(`/admin/stats/time-series?days=${selectedPeriod}`);
                // Format dates for display
                const formattedData = res.data.dailyStats.map(d => ({
                    ...d,
                    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }));
                setTimeSeriesData(formattedData);
            } catch (err) {
                console.error("Failed to load time series:", err);
            } finally {
                setTimeSeriesLoading(false);
            }
        };
        fetchTimeSeries();
    }, [selectedPeriod]);

    // Fetch product-wise trends
    useEffect(() => {
        const fetchProductTrends = async () => {
            try {
                setProductTrendsLoading(true);
                const res = await api.get(`/admin/stats/product-trends?days=${selectedPeriod}&top=${topProductsCount}`);
                setProductTrends(res.data);
            } catch (err) {
                console.error("Failed to load product trends:", err);
            } finally {
                setProductTrendsLoading(false);
            }
        };
        fetchProductTrends();
    }, [selectedPeriod, topProductsCount]);

    if (loading) return <div className="p-6">Loading sales stats…</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    // Prepare chart data - top 10 items
    const chartData = stats.items
        ?.slice(0, 10)
        .map((item, index) => ({
            name: item.name || `Item ${index + 1}`,
            soldQuantity: item.soldQuantity || 0,
            revenue: item.revenue || 0
        })) || [];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Sales Overview</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
                    <div className="text-gray-500 text-sm">Total Orders</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalOrders}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                    <div className="text-gray-500 text-sm">Items Sold</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.totalItemsSold}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                    <div className="text-gray-500 text-sm">Total Revenue</div>
                    <div className="text-2xl font-bold text-gray-800">${stats.totalRevenue?.toFixed(2) || "0.00"}</div>
                </div>
            </div>

            {/* Time Series Chart */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Sales Trend</h3>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={60}>Last 60 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
                {timeSeriesLoading ? (
                    <div className="h-64 flex items-center justify-center text-gray-500">Loading trend data...</div>
                ) : timeSeriesData.length > 0 ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="displayDate"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "12px"
                                    }}
                                    formatter={(value, name) => [
                                        name === "Orders" ? `${value} orders` : `$${value?.toFixed(2) || '0.00'}`,
                                        name
                                    ]}
                                />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    fill="url(#colorOrders)"
                                    name="Orders"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    fill="url(#colorRevenue)"
                                    name="Revenue ($)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">No trend data available</div>
                )}
            </div>

            {/* Product Trends Chart */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Product-wise Trends</h3>
                    <div className="flex gap-2">
                        <select
                            value={topProductsCount}
                            onChange={(e) => setTopProductsCount(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value={3}>Top 3 Products</option>
                            <option value={5}>Top 5 Products</option>
                            <option value={7}>Top 7 Products</option>
                            <option value={10}>Top 10 Products</option>
                        </select>
                    </div>
                </div>
                {productTrendsLoading ? (
                    <div className="h-72 flex items-center justify-center text-gray-500">Loading product trends...</div>
                ) : productTrends.products.length > 0 ? (
                    <>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="displayDate"
                                        type="category"
                                        allowDuplicatedCategory={false}
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            fontSize: "12px"
                                        }}
                                    />
                                    <Legend />
                                    {productTrends.products.map((product, index) => (
                                        <Line
                                            key={product.id}
                                            data={product.data.map(d => ({
                                                ...d,
                                                displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            }))}
                                            type="monotone"
                                            dataKey="quantity"
                                            name={product.name}
                                            stroke={COLORS[index % COLORS.length]}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Product Legend with totals */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            {productTrends.products.map((product, index) => (
                                <div key={product.id} className="flex items-center gap-2 text-sm">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></span>
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-gray-500">({product.totalQuantity} sold)</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="h-72 flex items-center justify-center text-gray-500">No product trend data available</div>
                )}
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 mb-8">
                    <h3 className="text-xl font-semibold mb-4">Top Selling Items</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={90}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === "soldQuantity" ? `${value} units` : `$${value.toFixed(2)}`,
                                        name === "soldQuantity" ? "Quantity Sold" : "Revenue"
                                    ]}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px"
                                    }}
                                />
                                <Bar dataKey="soldQuantity" name="Quantity Sold" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold p-4 border-b">Bestselling Items</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {stats.items && stats.items.length > 0 ? (
                                stats.items.map((it, idx) => (
                                    <tr key={it.menuItemId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] + "20", color: COLORS[idx % COLORS.length] }}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{it.name || it.menuItemId}</td>
                                        <td className="px-4 py-3 text-gray-600">{it.soldQuantity || 0}</td>
                                        <td className="px-4 py-3 text-gray-600">${((it.revenue || 0)).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No sales data yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
