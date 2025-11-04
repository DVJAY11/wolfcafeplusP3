import React from "react";
import { useCart } from "../context/CartContext";

export default function MenuItemCard({ item }) {
  const { cart, addToCart, updateQty, removeFromCart } = useCart();

  // find this item in cart
  const existing = cart.find((p) => p._id === item._id);
  const qty = existing ? existing.qty : 0;

  const increment = () => addToCart(item); // just reuse your addToCart logic
  const decrement = () => {
    if (qty <= 1) removeFromCart(item._id);
    else updateQty(item._id, qty - 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg p-4 flex flex-col transition">
      <img
        src={item.image || "/placeholder.jpg"}
        alt={item.name}
        className="w-full h-40 object-cover rounded-xl mb-3"
      />
      <h3 className="text-lg font-semibold text-amber-900">{item.name}</h3>
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
      )}
      <p className="mt-auto text-md font-medium text-gray-700 mb-3">
        ${item.price.toFixed(2)}
      </p>

      {/* 🔸 Increment/Decrement Row */}
      <div className="flex justify-center items-center space-x-4">
        {qty > 0 ? (
          <>
            <button
              onClick={decrement}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
            >
              −
            </button>
            <span className="text-lg font-semibold text-gray-800">{qty}</span>
            <button
              onClick={increment}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="bg-amber-700 hover:bg-amber-800 text-white font-medium px-6 py-2 rounded-xl transition"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
