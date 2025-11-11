import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useModal } from "./ModalContext";
import api from "../api/axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const { showLoginModal } = useModal();

  // Fetch cart when user logs in
  const fetchCart = async () => {
    if (!user) {
      setCart([]); // clear cart on logout
      return;
    }
    try {
      const res = await api.get("/cart");
      // backend returns { cart: {...} }
      setCart(res.data.cart?.items || []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  // Load cart when user logs in
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Update cart item quantity
  const updateCartItem = async (item, change = 1) => {
    if (!user) {
      showLoginModal();
      return;
    }

    try {
      const res = await api.post("/cart", {
        menuItem: item._id,
        quantity: change,
      });
      setCart(res.data.cart?.items || []);
    } catch (err) {
      console.error("Error updating cart:", err.response?.data || err);
    }
  };

  // ➕ Increment quantity
  const incrementItem = (item) => updateCartItem(item, 1);

  // ➖ Decrement quantity
  const decrementItem = (item) => updateCartItem(item, -1);

  // Remove item completely
  const removeFromCart = async (menuItemId) => {
    if (!user) return;
    try {
      const res = await api.delete(`/cart/${menuItemId}`);
      setCart(res.data.cart?.items || []);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // Clear local cart (logout or cleanup)
  const clearCart = () => setCart([]);

  // Shortcut alias
  const addToCart = (item) => incrementItem(item);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        incrementItem,
        decrementItem,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
