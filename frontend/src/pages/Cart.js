import React, { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Cart() {
  const { cart, removeFromCart, incrementItem, decrementItem, clearCart } = useCart();
  const TAX_RATE = 0.08; // Fixed 8% tax rate
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
          (item.quantity || item.qty || 0)) +
        (item.customizations?.reduce((s, c) => s + c.price, 0) || 0) * (item.quantity || 1),
      0
    );
  }, [cart]);

  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount + tip;

  // Group items by mealGroupId
  const groupedItems = useMemo(() => {
    const groups = {};
    const standalone = [];

    cart.forEach(item => {
      if (item.mealGroupId) {
        if (!groups[item.mealGroupId]) groups[item.mealGroupId] = [];
        groups[item.mealGroupId].push(item);
      } else {
        standalone.push(item);
      }
    });

    return { groups, standalone };
  }, [cart]);

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
          customizations: item.customizations || [],
          mealGroupId: item.mealGroupId,
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

  const renderCartItem = (item, isBundled = false) => {
    const menu = item.menuItem || item;
    const price = menu.price || 0;
    const name = menu.name || "Unnamed item";
    // const itemTotal = (price + (item.customizations?.reduce((s, c) => s + c.price, 0) || 0)) * item.quantity;

    return (
      <div
        key={ item._id || `${menu._id}-${Math.random()}` }
        className={ `flex justify-between items-center ${isBundled ? 'py-2 border-b last:border-0 border-gray-100' : 'bg-white shadow-md rounded-lg p-4 mb-4'}` }
      >
        <div>
          <h3 className={ `font-semibold text-gray-800 ${isBundled ? 'text-base' : 'text-lg'}` }>{ name }</h3>
          <p className="text-gray-500 text-sm">${ price.toFixed(2) }</p>
          { item.customizations && item.customizations.length > 0 && (
            <ul className="text-xs text-gray-600 mt-1 ml-2 list-disc">
              { item.customizations.map((cust, idx) => (
                <li key={ idx }>
                  + { cust.name } (${ cust.price.toFixed(2) })
                </li>
              )) }
            </ul>
          ) }
        </div>

        <div className="flex items-center gap-3">
          { !isBundled && (
            <>
              <button
                onClick={ () => decrementItem(menu) }
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
              >
                −
              </button>
              <span className="text-lg font-semibold text-gray-800">
                { item.quantity || item.qty }
              </span>
              <button
                onClick={ () => incrementItem(menu) }
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300"
              >
                +
              </button>
            </>
          ) }
          { isBundled && <span className="text-gray-600 text-sm">x{ item.quantity }</span> }

          <button
            onClick={ () => removeFromCart(item._id) }
            className="ml-4 text-red-600 hover:text-red-800"
            title="Remove Item"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-red-800 mb-6">Your Cart</h1>

      {/* Meal Bundles */ }
      { Object.entries(groupedItems.groups).map(([groupId, items]) => (
        <div key={ groupId } className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3 border-b border-red-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍱</span>
              <h3 className="font-bold text-red-800 text-lg">Meal Bundle</h3>
            </div>
            <span className="text-sm text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
              Bundle Total: ${ items.reduce((sum, item) => sum + (item.menuItem.price + (item.customizations?.reduce((s, c) => s + c.price, 0) || 0)) * item.quantity, 0).toFixed(2) }
            </span>
          </div>
          <div className="pl-2">
            { items.map((item) => renderCartItem(item, true)) }
          </div>
        </div>
      )) }

      {/* Standalone Items */ }
      { groupedItems.standalone.map((item) => renderCartItem(item, false)) }

      {/* 🧾 Summary section */ }
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <div className="flex justify-between text-gray-700 mb-3">
          <span>Subtotal:</span>
          <span>${ subtotal.toFixed(2) }</span>
        </div>

        <div className="flex justify-between text-gray-700 mb-3">
          <span>Tax (8%):</span>
          <span>${ taxAmount.toFixed(2) }</span>
        </div>

        <div className="flex justify-between text-gray-700 mb-3">
          <label>
            Tip:
            <input
              type="number"
              min="0"
              step="0.5"
              value={ tip }
              onChange={ (e) => setTip(parseFloat(e.target.value) || 0) }
              className="ml-2 w-20 border border-gray-300 rounded px-1 text-center"
            />
          </label>
          <span>${ tip.toFixed(2) }</span>
        </div>

        <hr className="my-3" />

        <div className="flex justify-between font-bold text-lg text-gray-800">
          <span>Total:</span>
          <span>${ total.toFixed(2) }</span>
        </div>

        <button
          onClick={ handleCheckout }
          disabled={ loading }
          className={ `mt-6 w-full py-3 rounded-lg text-white font-semibold ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-amber-700 hover:bg-amber-800 transition"
            }` }
        >
          { loading ? "Processing..." : "Checkout" }
        </button>

        { error && <p className="text-center text-red-600 mt-4">{ error }</p> }

        {/* ✅ Order confirmation */ }
        { orderSummary && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              ✅ Order Placed Successfully!
            </h2>
            <p className="text-gray-700 text-sm">
              Order ID: <span className="font-mono">{ orderSummary._id }</span>
            </p>
            <p className="text-gray-700 text-sm mt-1">
              Total: <span className="font-semibold">${ orderSummary.total.toFixed(2) }</span>
            </p>
          </div>
        ) }
      </div>
    </div>
  );
}
