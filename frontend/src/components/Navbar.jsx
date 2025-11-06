import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useCart } from "../context/CartContext"; // ✅ import this
import api from "../api/axios";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { user, logout, login } = useContext(AuthContext);
  const { showLogin, showLoginModal, hideLoginModal } = useModal();
  const { cart } = useCart();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate total items in cart (sum of all quantities)
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);

  // handle login or signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        // --- Sign Up API call ---
        await api.post("/auth/register", formData);
        alert("Account created successfully! Please log in.");
        setIsSignup(false);
      } else {
        // --- Login (existing AuthContext logic) ---
        await login(formData.email, formData.password);
        hideLoginModal();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const transparent = location.pathname === "/" && !scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-4 transition-colors duration-300 ${
          transparent
            ? "bg-transparent text-white"
            : "bg-black/90 text-white shadow-md"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="WrikiCafe Logo"
            className="h-16 w-16 object-contain"
            style={{ marginRight: "0.05rem" }}
          />
          <span className="text-4xl tracking-widest font-bold">
            <span style={{ fontFamily: "'Anton', sans-serif" }} className="text-white">WRIKI</span>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-red-600 ml-1">CAFE+</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 text-base font-medium">
          <Link to="/" className="hover:text-red-500 transition">Home</Link>
          <Link to="/menu" className="hover:text-red-500 transition">Menu</Link>
          <Link to="/about" className="hover:text-red-600">About Us</Link>

          {/* Cart Badge Updated Dynamically */}
          <Link to="/cart" className="hover:text-red-500 transition flex items-center gap-2 relative">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-red-500 transition flex items-center gap-2">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-white-600">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-white hover:bg-gray-100 text-red-700 px-3 py-1 rounded-full font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => showLoginModal()}
              className="bg-white hover:bg-gray-100 text-red-700 px-3 py-1 rounded-full font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* 🔸 Login / Signup Modal (unchanged) */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg relative">
            <button
              onClick={() => hideLoginModal()}
              className="absolute top-2 right-3 text-gray-500 text-lg font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
              {isSignup ? "Create Account" : "Login"}
            </h2>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-red-400"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-red-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-red-400"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>

            <p className="text-center mt-3 text-gray-600 text-sm">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignup(false)}
                    className="text-red-600 underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setIsSignup(true)}
                    className="text-red-600 underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}