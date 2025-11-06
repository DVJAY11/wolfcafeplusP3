import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../context/CartContext";

jest.mock("../context/CartContext", () => ({
  useCart: jest.fn(),
}));

describe("☕ MenuItemCard Component", () => {
  const mockItem = {
    _id: "123",
    name: "Latte",
    description: "Smooth espresso with milk",
    price: 4.5,
    image: "latte.jpg",
  };

  const baseCartFns = {
    addToCart: jest.fn(),
    incrementItem: jest.fn(),
    decrementItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders item name, description, and price", () => {
    useCart.mockReturnValue({ cart: [], ...baseCartFns });
    render(<MenuItemCard item={mockItem} />);

    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Smooth espresso with milk")).toBeInTheDocument();
    expect(screen.getByText("$4.50")).toBeInTheDocument();
  });

  test("shows 'Add to Cart' when item not in cart", () => {
    useCart.mockReturnValue({ cart: [], ...baseCartFns });
    render(<MenuItemCard item={mockItem} />);

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(baseCartFns.addToCart).toHaveBeenCalledWith(mockItem);
  });

  test("shows quantity controls when item is in cart", () => {
    useCart.mockReturnValue({
      cart: [{ menuItem: mockItem, quantity: 2 }],
      ...baseCartFns,
    });
    render(<MenuItemCard item={mockItem} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("−")).toBeInTheDocument();
  });

  test("increments item when '+' clicked", () => {
    useCart.mockReturnValue({
      cart: [{ menuItem: mockItem, quantity: 1 }],
      ...baseCartFns,
    });
    render(<MenuItemCard item={mockItem} />);

    fireEvent.click(screen.getByText("+"));
    expect(baseCartFns.incrementItem).toHaveBeenCalledWith(mockItem);
  });

  test("decrements item when '−' clicked and quantity > 0", () => {
    useCart.mockReturnValue({
      cart: [{ menuItem: mockItem, quantity: 2 }],
      ...baseCartFns,
    });
    render(<MenuItemCard item={mockItem} />);

    fireEvent.click(screen.getByText("−"));
    expect(baseCartFns.decrementItem).toHaveBeenCalledWith(mockItem);
  });

    test("does not call decrement when quantity is 0 (no decrement button shown)", () => {
    useCart.mockReturnValue({
      cart: [{ menuItem: mockItem, quantity: 0 }],
      ...baseCartFns,
    });
    render(<MenuItemCard item={mockItem} />);

    // It should show "Add to Cart", not the minus button
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();

    // And it should NOT render a decrement (−) button
    expect(screen.queryByText("−")).not.toBeInTheDocument();

    // Double-check no decrement call
    expect(baseCartFns.decrementItem).not.toHaveBeenCalled();
  });

  test("renders placeholder image if no image provided", () => {
    const itemNoImage = { ...mockItem, image: "" };
    useCart.mockReturnValue({ cart: [], ...baseCartFns });

    render(<MenuItemCard item={itemNoImage} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/placeholder.jpg");
  });

  test("renders 'Unnamed item' if no name provided", () => {
    const noNameItem = { ...mockItem, name: "" };
    useCart.mockReturnValue({ cart: [], ...baseCartFns });

    render(<MenuItemCard item={noNameItem} />);
    expect(screen.getByText("Unnamed item")).toBeInTheDocument();
  });
});
