// frontend/src/pages/MyGroupOrders.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useGroupOrder } from "../context/GroupOrderContext";

export default function MyGroupOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setGroupOrder } = useGroupOrder();
  const navigate = useNavigate();

  const handleUseInMenu = (order) => {
    // put the chosen order into context
    setGroupOrder(order);
    // go to menu so user can add items to this group order
    navigate("/menu");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/group-orders/mine"); // must match backend route
        setOrders(res.data.groupOrders || []);
      } catch (err) {
        console.error("Failed to load my group orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 p-8 text-lg">
        Loading your group orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="pt-24 p-8">
        <h1 className="text-2xl font-semibold mb-4">My Group Orders</h1>
        <p className="text-gray-600">
          You don&apos;t have any group orders yet. Start one from the{" "}
          <Link to="/group-order" className="text-red-600 underline">
            Group Order
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 p-8">
      <h1 className="text-2xl font-semibold mb-6">My Group Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const totalItems =
            order.participants?.reduce(
              (sum, p) => sum + (p.items?.length || 0),
              0
            ) || 0;
          const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();

          return (
            <div
              key={order._id}
              className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <div className="text-sm text-gray-500">
                  Share code:{" "}
                  <span className="font-mono font-semibold">
                    {order.shareCode}
                  </span>
                </div>
                <div className="mt-1">
                Status:{" "}
                <span className="font-semibold capitalize">
                {isExpired ? "expired" : order.status}
                </span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Total: $
                  {typeof order.total === "number"
                    ? order.total.toFixed(2)
                    : order.total}{" "}
                  • {totalItems} item(s)
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Created:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Link
                  to={`/group-order/${order.shareCode}`}
                  className="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                >
                  Open Session
                </Link>

                {order.status === "open" && (
                  <button
                    onClick={() => handleUseInMenu(order)}
                    className="px-3 py-1 rounded-full text-xs bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Use This Order in Menu
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
