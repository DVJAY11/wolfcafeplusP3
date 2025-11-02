import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import MenuItemCard from "../components/MenuItemCard";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get("/api/menu")
      .then((res) => setMenu(res.data))
      .catch((err) => console.error("❌ Failed to load menu:", err))
      .finally(() => setLoading(false));
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
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {menu.map((item) => (
        <MenuItemCard key={item._id || item.id} item={item} onAdd={() => addToCart(item)} />
      ))}
    </div>
  );
}
