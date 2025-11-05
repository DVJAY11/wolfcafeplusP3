import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/orders/${id}`, { status: newStatus });
      fetchOrders(); // refresh after update
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading orders...</p>;

  // Helper: group orders by status
  const groupedOrders = {
    pending: orders.filter((o) => o.status === "pending"),
    in_progress: orders.filter((o) => o.status === "in_progress"),
    ready: orders.filter((o) => o.status === "ready"),
    completed: orders.filter((o) => o.status === "completed"),
  };

  // Helper: color badges
  const statusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-200 text-yellow-800",
      in_progress: "bg-blue-200 text-blue-800",
      ready: "bg-green-200 text-green-800",
      completed: "bg-gray-200 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  // Reusable table component
  const OrdersTable = ({ title, data }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-amber-800 mb-3">
        {title} ({data.length})
      </h2>
      {data.length === 0 ? (
        <p className="text-gray-600 text-sm">No orders in this category.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="border px-4 py-2">Order ID</th>
              <th className="border px-4 py-2">Customer</th>
              <th className="border px-4 py-2">Items</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="border px-4 py-2">{order._id}</td>
                <td className="border px-4 py-2">{order.user?.name}</td>
                <td className="border px-4 py-2">
                  {order.items
                    .map(
                      (i) =>
                        `${i.menuItem?.name || "Unknown"} ×${i.quantity || 1}`
                    )
                    .join(", ")}
                </td>
                <td className="border px-4 py-2">{statusBadge(order.status)}</td>
                <td className="border px-4 py-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">
        Manage Orders
      </h1>

      <OrdersTable title="☕ Pending Orders" data={groupedOrders.pending} />
      <OrdersTable title="👩‍🍳 In Progress Orders" data={groupedOrders.in_progress} />
      <OrdersTable title="📦 Ready for Pickup" data={groupedOrders.ready} />
      <OrdersTable title="✅ Completed Orders" data={groupedOrders.completed} />
    </div>
  );
}
