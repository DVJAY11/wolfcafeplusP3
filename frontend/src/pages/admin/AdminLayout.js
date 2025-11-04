import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaTachometerAlt, FaClipboardList, FaUtensils, FaHome } from "react-icons/fa";

export default function AdminLayout() {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition 
     ${isActive ? "bg-amber-600 text-white" : "text-gray-700 hover:bg-amber-100"}`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-amber-700 mb-6 text-center">☕ WolfCafe+</h1>
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin" end className={navLinkClass}>
              <FaTachometerAlt /> Dashboard
            </NavLink>
            <NavLink to="/admin/orders" className={navLinkClass}>
              <FaClipboardList /> Manage Orders
            </NavLink>
            <NavLink to="/admin/items" className={navLinkClass}>
              <FaUtensils /> Manage Items
            </NavLink>
            <NavLink to="/" className={navLinkClass}>
              <FaHome /> Back to Home
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t text-center text-sm text-gray-500">
          Welcome, <span className="font-semibold text-amber-700">Admin</span>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <Outlet /> {/* renders child pages here */}
      </main>
    </div>
  );
}
