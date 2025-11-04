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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, menuRes, cartRes] = await Promise.all([
          api.get("/auth/users"),
          api.get("/menu"),
          api.get("/cart"),
        ]);

        const totalRevenue = cartRes.data.reduce((sum, c) => {
          const cartTotal = c.items?.reduce(
            (acc, i) => acc + (i.menuItem?.price || 0) * i.quantity,
            0
          );
          return sum + (cartTotal || 0);
        }, 0);

        setStats({
          totalUsers: usersRes.data.length,
          totalMenuItems: menuRes.data.length,
          totalOrders: cartRes.data.length,
          totalRevenue: totalRevenue.toFixed(2),
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-700 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FaUser />} title="Users" value={stats.totalUsers} color="bg-amber-100" />
        <StatCard icon={<FaCoffee />} title="Menu Items" value={stats.totalMenuItems} color="bg-yellow-100" />
        <StatCard icon={<FaShoppingCart />} title="Orders" value={stats.totalOrders} color="bg-orange-100" />
        <StatCard icon={<FaMoneyBillWave />} title="Revenue" value={`$${stats.totalRevenue}`} color="bg-green-100" />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`p-6 rounded-xl shadow-md flex flex-col items-center justify-center ${color}`}>
      <div className="text-3xl mb-2 text-gray-700">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-2xl font-bold text-amber-700 mt-1">{value}</p>
    </div>
  );
}
