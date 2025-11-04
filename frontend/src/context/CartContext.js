import { createContext, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useModal } from "./ModalContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const { showLoginModal } = useModal();

  const addToCart = (item) => {
    if (!user) {
      localStorage.setItem("pendingItem", JSON.stringify(item));
      showLoginModal();
      return;
    }

    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      return existing
        ? prev.map((p) =>
            p._id === item._id ? { ...p, qty: p.qty + 1 } : p
          )
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p._id !== id));

  const updateQty = (id, qty) =>
    setCart((prev) =>
      prev.map((p) => (p._id === id ? { ...p, qty } : p))
    );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
