import React, { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Cart() {
  const { cart, removeFromCart, incrementItem, decrementItem, clearCart } = useCart();
  const [taxRate, setTaxRate] = useState(0.08); // default 8%
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const [error, setError] = useState("");

  // 🧮 Calculate subtotal, tax, and total
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        ((item.menuItem?.price || item.price || 0) *
          (item.quantity || item.qty || 0)),
      0
    );
  }, [cart]);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount + tip;

  // 🛒 Empty cart state
  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty ☕</h2>
        <p>Add some items from the menu to get started!</p>
      </div>
    );
  }

  // ✅ Checkout handler
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");
      setOrderSummary(null);

      // Send to backend (your controller now accepts full breakdown)
      const res = await api.post("/orders", {
        items: cart.map((item) => ({
          menuItem: item.menuItem?._id || item._id,
          name: item.menuItem?.name || item.name,
          price: item.menuItem?.price || item.price,
          quantity: item.quantity || item.qty,
        })),
        subtotal,
        tax: taxAmount,
        tip,
        total,
      });

      // ✅ Success
      setOrderSummary(res.data.order);
      clearCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Your Cart</h1>

      {/* Cart items */}
      {cart.map((item, index) => {
        const menu = item.menuItem || item;
        const price = menu.price || 0;
        const name = menu.name || "Unnamed item";

        return (
          <div
            key={`${menu._id || item._id}-${index}`}
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

      {/* 🧾 Summary section */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <div className="flex justify-between text-gray-700 mb-3">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-700 mb-3">
          <label>
            Tax Rate:
            <input
              type="number"
              step="0.01"
              min="0"
              max="0.2"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="ml-2 w-16 border border-gray-300 rounded px-1 text-center"
            />
          </label>
          <span>${taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-700 mb-3">
          <label>
            Tip:
            <input
              type="number"
              min="0"
              step="0.5"
              value={tip}
              onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
              className="ml-2 w-20 border border-gray-300 rounded px-1 text-center"
            />
          </label>
          <span>${tip.toFixed(2)}</span>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between font-bold text-lg text-gray-800">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-amber-700 hover:bg-amber-800 transition"
          }`}
        >
          {loading ? "Processing..." : "Checkout"}
        </button>

        {error && <p className="text-center text-red-600 mt-4">{error}</p>}

        {/* ✅ Order confirmation */}
        {orderSummary && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              ✅ Order Placed Successfully!
            </h2>
            <p className="text-gray-700 text-sm">
              Order ID: <span className="font-mono">{orderSummary._id}</span>
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Total: <span className="font-semibold">${orderSummary.total.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
