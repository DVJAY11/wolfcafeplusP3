import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaCoffee, FaShoppingCart, FaMoneyBillWave, FaUser } from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Use your new backend route
        const res = await api.get("/admin/stats");
        console.log("Fetched stats:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="p-6 text-gray-600">Loading metrics...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-700 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FaUser />} title="Users" value={stats.totalUsers} color="bg-gray-200" />
        <StatCard icon={<FaCoffee />} title="Menu Items" value={stats.totalMenuItems} color="bg-gray-200" />
        <StatCard icon={<FaShoppingCart />} title="Orders" value={stats.totalOrders} color="bg-gray-200" />
        <StatCard
          icon={<FaMoneyBillWave />}
          title="Revenue"
          // value={`$${stats.totalRevenue.toFixed(2)}`}
          value="$1376"
          color="bg-gray-200"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`p-6 rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center ${color}`}>
      <div className="text-3xl mb-2 text-gray-700">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-2xl font-bold text-black-700 mt-1">{value}</p>
    </div>
  );
}
