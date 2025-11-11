import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

export default function ManageItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchCart } = useCart();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/menu?all=true");
        setItems(res.data);
      } catch {
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const toggleAvailability = async (id, available) => {
    try {
      const endpoint = available
        ? `/menu/${id}/archive`
        : `/menu/${id}/restore`;

      const res = await api.patch(endpoint);
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, available: res.data.item.available } : item
        )
      );
      await fetchCart();
    } catch (err) {
      console.error("Error updating item availability:", err);
      alert("Error updating item availability");
    }
  };

  if (loading) return <p className="p-4">Loading items...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-red-800">Manage Menu Items</h1>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            className={`border rounded-xl p-4 shadow hover:shadow-md transition ${
              !item.available ? "opacity-60 bg-gray-100" : "bg-white"
            }`}
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h3 className="text-lg font-semibold text-black-900">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <p className="font-medium">${item.price.toFixed(2)}</p>

            {/* Availability tag */}
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                item.available
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {item.available ? "Available" : "Unavailable"}
            </span>

            {/* Toggle button */}
            <button
              onClick={() => toggleAvailability(item._id, item.available)}
              className={`mt-3 w-full py-2 rounded-lg font-medium transition ${
                item.available
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {item.available ? "Mark Unavailable" : "Make Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
