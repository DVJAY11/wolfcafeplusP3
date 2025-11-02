import React from "react";

export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg p-4 flex flex-col">
      <img
        src={item.image || "/placeholder.jpg"}
        alt={item.name}
        className="w-full h-40 object-cover rounded-xl mb-3"
      />
      <h3 className="text-lg font-semibold text-amber-900">{item.name}</h3>
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
      )}
      <p className="mt-auto text-md font-medium text-gray-700">${item.price.toFixed(2)}</p>
      <button
        onClick={onAdd}
        className="mt-3 bg-amber-700 text-white py-2 rounded-xl hover:bg-amber-800 transition"
      >
        Add to Cart
      </button>
    </div>
  );
}
