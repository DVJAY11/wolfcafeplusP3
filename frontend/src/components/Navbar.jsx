import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios"; // your configured axios instance

export default function Navbar() {
  const { user, logout, login } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

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
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* 🔸 Navbar */}
      <nav className="bg-amber-600 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-yellow-200 font-semibold">Home</Link>
          <Link to="/menu" className="hover:text-yellow-200 font-semibold">Menu</Link>
          <Link to="/cart" className="hover:text-yellow-200 font-semibold">Cart</Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-yellow-200 font-semibold">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-yellow-100">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-yellow-300 hover:bg-yellow-400 text-gray-700 px-3 py-1 rounded font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-gray-100 text-amber-600 px-3 py-1 rounded font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* 🔸 Login / Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
                  className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-yellow-400"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-yellow-400"
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-md"
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
                    className="text-amber-600 underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setIsSignup(true)}
                    className="text-amber-600 underline"
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
