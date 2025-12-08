// frontend/src/components/MenuItemCard.js
import React from "react";
import { useCart } from "../context/CartContext";
import { useGroupOrder } from "../context/GroupOrderContext";

export default function MenuItemCard({ item, children }) {
  const { cart, addToCart, incrementItem, decrementItem } = useCart();
  const { groupOrder, addItemToGroupOrder } = useGroupOrder();
  // Are we currently inside an open group order?
  const inOpenGroup = !!groupOrder && groupOrder.status === "open";

  // find this item in cart (handle both populated and plain cart)
  const existing = cart.find(
    (p) =>
      p.menuItem?._id === item._id || // from backend populate
      p._id === item._id              // from local/frontend
  );

  // handle both 'quantity' (backend) and 'qty' (local)
  const qty = existing ? existing.quantity || existing.qty : 0;

  const handleIncrement = () => incrementItem(item);
  const handleDecrement = () => {
    if (qty > 0) decrementItem(item);
  };

  const handleAddToGroup = async () => {
    try {
      await addItemToGroupOrder(item._id, 1, []);
    } catch (err) {
      console.error("Failed to add to group order", err);

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not add to group order. Please try again.";

      alert(msg);
    }
  };


  return (
    <div className="bg-orange-50 rounded-2xl shadow hover:shadow-lg p-4 flex flex-col transition h-full">
      <img
        src={ item.image || "/placeholder.jpg" }
        alt={ item.name || "Menu item" }
        className="w-full h-40 object-cover rounded-xl mb-3"
      />

      <h3 className="text-lg font-semibold text-red-900 mb-1">
        { item.name || "Unnamed item" }
      </h3>

      <div className="h-12 mb-3">
        { item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{ item.description }</p>
        ) }
      </div>

      <p className="mt-auto text-md font-medium text-gray-700 mb-3">
        ${ item.price ? item.price.toFixed(2) : "0.00" }
      </p>

      <div className="flex justify-center items-center space-x-4">
        { qty > 0 ? (
          <>
            <button
              onClick={ handleDecrement }
              disabled={ qty <= 0 }
              className={ `px-3 py-1 rounded-full font-bold text-lg transition ${qty <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }` }
            >
              −
            </button>

            <span className="text-lg font-semibold text-gray-800">{ qty }</span>

            <button
              onClick={ handleIncrement }
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300 transition"
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={ () => addToCart(item) }
            className="bg-red-700 hover:bg-red-800 text-white font-medium px-6 py-2 rounded-xl transition"
          >
            Add to Cart
          </button>
        ) }
      </div>

      { children && <div className="mt-4 pt-3 border-t border-orange-100">{ children }</div> }
      {/* 🔹 Extra button: Add to current group order (if one is active) */ }
      { inOpenGroup && (
        <button
          onClick={ handleAddToGroup }
          className="w-full border border-purple-500 text-purple-700 hover:bg-purple-50 text-xs font-medium px-4 py-2 rounded-xl transition"
        >
          Add to This Group Order ({ groupOrder.shareCode })
        </button>
      ) }

    </div>
  );
}
