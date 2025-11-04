// src/pages/Cart.js
import React from "react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, removeFromCart, incrementItem, decrementItem } = useCart();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty ☕</h2>
        <p>Add some items from the menu to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Your Cart</h1>

      {cart.map((item) => {
        const menu = item.menuItem || item; // support both structures
        const price = menu.price || 0;
        const name = menu.name || "Unnamed item";

        return (
          <div
            key={menu._id || item._id}
            className="flex justify-between items-center bg-white shadow-md rounded-lg p-4 mb-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
              <p className="text-gray-500">${price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => decrementItem(menu)}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
              >
                −
              </button>
              <span className="text-lg font-semibold text-gray-800">
                {item.quantity || item.qty}
              </span>
              <button
                onClick={() => incrementItem(menu)}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(menu._id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* Cart total */}
      <div className="text-right text-lg font-semibold mt-6 text-gray-800">
        Total: $
        {cart
          .reduce(
            (sum, item) =>
              sum + ((item.menuItem?.price || item.price || 0) * (item.quantity || item.qty)),
            0
          )
          .toFixed(2)}
      </div>
    </div>
  );
}
