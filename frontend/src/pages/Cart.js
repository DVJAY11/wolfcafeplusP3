// src/pages/Cart.js
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((i) => (
            <div key={i.id} className="flex justify-between items-center border-b py-3">
              <div>
                <h3>{i.name}</h3>
                <p>${i.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={i.qty}
                  onChange={(e) => updateQty(i.id, parseInt(e.target.value))}
                  className="w-16 border rounded text-center"
                />
                <button onClick={() => removeFromCart(i.id)}>🗑️</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-4 font-semibold">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={clearCart} className="bg-gray-200 px-4 py-2 rounded-xl">
              Clear
            </button>
            <a href="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded-xl">
              Checkout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
