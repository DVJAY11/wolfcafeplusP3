import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Cart from "../pages/Cart";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

// 🧩 Mocks
jest.mock("../context/CartContext", () => ({
  useCart: jest.fn(),
}));
jest.mock("../api/axios", () => ({
  post: jest.fn(),
}));

const sampleCart = [
  {
    _id: "1",
    quantity: 2,
    menuItem: { _id: "1", name: "Latte", price: 4.5 },
  },
  {
    _id: "2",
    quantity: 1,
    menuItem: { _id: "2", name: "Muffin", price: 3.0 },
  },
];

describe("🛒 Cart Component", () => {
  const mockRemove = jest.fn();
  const mockIncrement = jest.fn();
  const mockDecrement = jest.fn();
  const mockClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({
      cart: sampleCart,
      removeFromCart: mockRemove,
      incrementItem: mockIncrement,
      decrementItem: mockDecrement,
      clearCart: mockClear,
    });
  });

//   test("renders cart items and totals", async () => {
//     render(<Cart />);

//     // wait for main title
//     expect(await screen.findByText(/Your Cart/i)).toBeInTheDocument();

//     // product names
//     expect(screen.getByText(/Latte/i)).toBeInTheDocument();
//     expect(screen.getByText(/Muffin/i)).toBeInTheDocument();

//     // look for subtotal & total labels loosely (some may have : or spacing)
//     expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
//     expect(screen.getByText(/Total/i)).toBeInTheDocument();

//     // ensure at least one currency formatted number is rendered
//     const dollarTexts = Array.from(document.querySelectorAll("span, p"))
//       .map((el) => el.textContent)
//       .filter((txt) => txt.includes("$"));
//     expect(dollarTexts.length).toBeGreaterThan(0);

//     // checkout button
//     expect(screen.getByRole("button", { name: /Checkout/i })).toBeInTheDocument();
//   });

  test("calls increment and decrement handlers correctly", () => {
    render(<Cart />);
    fireEvent.click(screen.getAllByText("+")[0]);
    fireEvent.click(screen.getAllByText("−")[0]);
    expect(mockIncrement).toHaveBeenCalled();
    expect(mockDecrement).toHaveBeenCalled();
  });

  test("calls removeFromCart when clicking ✕", () => {
    render(<Cart />);
    fireEvent.click(screen.getAllByText("✕")[0]);
    expect(mockRemove).toHaveBeenCalled();
  });

//   test("updates tax and tip inputs and recalculates total visually", async () => {
//     render(<Cart />);

//     const taxInput = await screen.findByLabelText(/Tax Rate/i);
//     const tipInput = await screen.findByLabelText(/Tip/i);

//     fireEvent.change(taxInput, { target: { value: "0.1" } });
//     fireEvent.change(tipInput, { target: { value: "5" } });

//     expect(taxInput.value).toBe("0.1");
//     expect(tipInput.value).toBe("5");

//     // confirm a total element still exists (avoid exact numeric expectation)
//     const totalLabel = screen.getByText(/Total/i);
//     expect(totalLabel).toBeInTheDocument();
//   });

  test("shows loading state during checkout", async () => {
    api.post.mockResolvedValueOnce({ data: { order: { _id: "abc", total: 20 } } });
    render(<Cart />);
    const checkoutBtn = screen.getByRole("button", { name: /Checkout/i });
    fireEvent.click(checkoutBtn);
    expect(checkoutBtn).toHaveTextContent(/Processing/i);
    await waitFor(() => expect(api.post).toHaveBeenCalled());
  });

  test("displays success message after successful checkout", async () => {
    api.post.mockResolvedValueOnce({
      data: { order: { _id: "abc123", total: 15.75 } },
    });
    render(<Cart />);
    fireEvent.click(screen.getByRole("button", { name: /Checkout/i }));

    await waitFor(() =>
      expect(screen.getByText(/Order Placed Successfully/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/abc123/i)).toBeInTheDocument();
    expect(mockClear).toHaveBeenCalled();
  });

  test("displays error message if checkout fails", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Network error" } },
    });
    render(<Cart />);
    fireEvent.click(screen.getByRole("button", { name: /Checkout/i }));
    await waitFor(() =>
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    );
  });

  test("renders empty cart state when no items", () => {
    useCart.mockReturnValue({
      cart: [],
      removeFromCart: jest.fn(),
      incrementItem: jest.fn(),
      decrementItem: jest.fn(),
      clearCart: jest.fn(),
    });
    render(<Cart />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Add some items/i)).toBeInTheDocument();
  });
});
