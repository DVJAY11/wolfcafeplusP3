import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import MenuItemCard from "../components/MenuItemCard";
import { useGroupOrder } from "../context/GroupOrderContext";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const { groupOrder } = useGroupOrder();
  const inGroupOrder = !!groupOrder && groupOrder.status === "open";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/menu");
        setMenu(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading menu…
      </div>
    );

  if (menu.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">No items yet</h2>
        <p>Admins can add items from the dashboard.</p>
      </div>
    );

    return (
      <div className="bg-white p-6">
  
        {/* ✅ STEP 2 — GROUP ORDER BANNER GOES HERE */}
        {inGroupOrder && (
          <div className="mb-6 px-4 py-3 rounded border border-purple-300 bg-purple-50 text-purple-800 text-sm">
            You are currently ordering with group code{" "}
            <strong>{groupOrder.shareCode}</strong>.  
            <br />
            Use the <strong>“Add to Group Order”</strong> button on any item.
          </div>
        )}
  
        {/* Existing menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menu.map((item) => (
            <MenuItemCard
              key={item._id || item.id}
              item={item}
              onAdd={() => addToCart(item)}
            />
          ))}
        </div>
      </div>
    );
  }
