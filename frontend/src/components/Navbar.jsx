import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { ShoppingCart } from "lucide-react"; // cart icon
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"></link>

export default function Navbar() {
  const { user, logout, login } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await api.post("/auth/register", formData);
        alert("Account created successfully! Please log in.");
        setIsSignup(false);
      } else {
        await login(formData.email, formData.password);
        setShowModal(false);
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
        {/* Left: Logo + Name */}
        <Link to="/" className="flex items-center space-x-3">
          <img
          src="/logo.png"
          alt="WolfCafe Logo"
          className="h-16 w-16 object-contain"
          style={{ marginRight: "0.05rem" }}
/>
        <span className="text-4xl tracking-widest font-bold">
          <span style={{ fontFamily: "'Anton', sans-serif" }} className="text-white">WOLF</span>
          <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-red-600 ml-1">CAFE+</span>
        </span>
        </Link>

        {/* Right: Navigation links */}
        <div className="flex items-center space-x-8 text-base font-medium">
          <Link to="/" className="hover:text-red-500 transition">Home</Link>
          <Link to="/menu" className="hover:text-red-500 transition">Menu</Link>
          <Link to="/cart" className="hover:text-red-500 transition flex items-center gap-2">
            <ShoppingCart size={18} />
            <span>Cart</span>
            <span className="text-sm bg-red-600 text-white px-1.5 rounded-full">0</span>
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="bg-white hover:bg-gray-100 text-red-700 px-3 py-1 rounded-full font-semibold"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-gray-100 text-red-700 px-3 py-1 rounded-full font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* 🔸 Login / Signup Modal (unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
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