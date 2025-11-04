import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import { CartProvider } from "./context/CartContext";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageItems from "./pages/admin/ManageItems";
import { ModalProvider } from "./context/ModalContext";

// ✅ Wrapper to handle conditional padding
function PageWrapper({ children }) {
  const location = useLocation();
  const isHome = location.pathname === "/"; // only homepage stays transparent

  return <div className={isHome ? "" : "pt-24"}>{children}</div>;
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <CartProvider>
          <Router>
            <PageWrapper>
            <Navbar />
            <Routes>
              {/* 🌐 Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />

              {/* 🔒 Authenticated (non-admin) protected routes */}
              <Route element={<ProtectedRoute />}>
              {/* example placeholder; you can add user-only routes here */}
              {/* <Route path="/profile" element={<UserProfile />} /> */}
            </Route>

              {/* 🧑‍💼 Admin-only protected routes */}
              <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="items" element={<ManageItems />} />
                </Route>
            </Route>
            </Routes>
            </PageWrapper>
          </Router>
        </CartProvider>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;