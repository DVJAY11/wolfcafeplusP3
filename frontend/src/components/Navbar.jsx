import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const location = useLocation();
  const { cart } = useCart();

  const linkClasses = (path) =>
    `px-3 py-2 rounded-md ${
      location.pathname === path
        ? "bg-amber-600 text-white"
        : "text-gray-700 hover:bg-amber-100"
    }`;

  return (
    <nav className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/" className="text-2xl font-bold text-amber-800">
          WolfCafe+
        </Link>
        <div className="flex gap-2">
          <Link to="/" className={linkClasses("/")}>Home</Link>
          <Link to="/menu" className={linkClasses("/menu")}>Menu</Link>
          <Link to="/cart" className={linkClasses("/cart")}>
            Cart {cart.length > 0 && <span className="ml-1">({cart.length})</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
