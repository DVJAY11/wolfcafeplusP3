import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import MenuItemCard from "../components/MenuItemCard";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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
    <div className="bg-white p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {menu.map((item) => (
        <MenuItemCard
          key={item._id || item.id}
          item={item}
          onAdd={() => addToCart(item)}
        />
      ))}
    </div>
  );
}
