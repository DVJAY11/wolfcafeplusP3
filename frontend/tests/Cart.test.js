// src/tests/Cart.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { useCart } from "../src/context/CartContext";
import Cart from "../src/pages/Cart";

jest.mock("../context/CartContext", () => ({
  useCart: jest.fn(),
}));

describe("Cart Page", () => {
  test("renders empty cart message", () => {
    useCart.mockReturnValue({
      cart: [],
      updateQty: jest.fn(),
      removeFromCart: jest.fn(),
      clearCart: jest.fn(),
    });
    render(<Cart />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test("renders items in cart", () => {
    useCart.mockReturnValue({
      cart: [{ id: 1, name: "Latte", price: 4.5, qty: 2 }],
      updateQty: jest.fn(),
      removeFromCart: jest.fn(),
      clearCart: jest.fn(),
    });
    render(<Cart />);
    expect(screen.getByText(/Latte/i)).toBeInTheDocument();
    expect(screen.getByText(/\$4.50/)).toBeInTheDocument();
  });

  test("calls removeFromCart when delete button clicked", () => {
    const mockRemove = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: 1, name: "Latte", price: 4.5, qty: 1 }],
      updateQty: jest.fn(),
      removeFromCart: mockRemove,
      clearCart: jest.fn(),
    });
    render(<Cart />);
    fireEvent.click(screen.getByText("🗑️"));
    expect(mockRemove).toHaveBeenCalledWith(1);
  });

  test("calls clearCart on Clear button click", () => {
    const mockClear = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: 1, name: "Latte", price: 4.5, qty: 1 }],
      updateQty: jest.fn(),
      removeFromCart: jest.fn(),
      clearCart: mockClear,
    });
    render(<Cart />);
    fireEvent.click(screen.getByText(/Clear/i));
    expect(mockClear).toHaveBeenCalled();
  });

  // 🆕 NEW TESTS BELOW — for higher coverage

  test("updates quantity correctly when select is changed", () => {
    const mockUpdateQty = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: 2, name: "Espresso", price: 3.0, qty: 1 }],
      updateQty: mockUpdateQty,
      removeFromCart: jest.fn(),
      clearCart: jest.fn(),
    });
    render(<Cart />);
    const select = screen.getByDisplayValue("1");
    fireEvent.change(select, { target: { value: "2" } });
    expect(mockUpdateQty).toHaveBeenCalledWith(2, 2);
  });

  test("renders total price correctly for multiple items", () => {
    useCart.mockReturnValue({
      cart: [
        { id: 1, name: "Latte", price: 4.5, qty: 2 },
        { id: 2, name: "Espresso", price: 3.0, qty: 1 },
      ],
      updateQty: jest.fn(),
      removeFromCart: jest.fn(),
      clearCart: jest.fn(),
    });
    render(<Cart />);
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    // optional stricter check for computed total value ($12.00)
    expect(screen.getByText(/\$12\.00/)).toBeInTheDocument();
  });
});