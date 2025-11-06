
// 🚨 Mock axios before importing component
jest.mock("../api/axios", () => ({
  get: jest.fn(),
}));

// Mock CartContext + MenuItemCard
jest.mock("../context/CartContext", () => ({
  useCart: jest.fn(),
}));
jest.mock("../components/MenuItemCard", () => (props) => (
  <div data-testid="menu-item" onClick={props.onAdd}>
    {props.item.name}
  </div>
));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Menu from "../pages/Menu";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

describe("🍽️ Menu Page", () => {
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({ addToCart: mockAddToCart });
  });

  test("renders loading state initially", () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Menu />);
    expect(screen.getByText(/Loading menu/i)).toBeInTheDocument();
  });

  test("renders 'No items yet' when API returns empty list", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<Menu />);
    await waitFor(() =>
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument()
    );
    expect(
      screen.getByText(/Admins can add items from the dashboard/i)
    ).toBeInTheDocument();
  });

  test("renders menu items when API returns data", async () => {
    const sampleItems = [
      { _id: "1", name: "Latte", price: 4.5 },
      { _id: "2", name: "Cappuccino", price: 4.25 },
    ];
    api.get.mockResolvedValueOnce({ data: sampleItems });

    render(<Menu />);
    await waitFor(() =>
      expect(screen.getAllByTestId("menu-item").length).toBe(2)
    );
    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Cappuccino")).toBeInTheDocument();
  });

  test("calls addToCart when a MenuItemCard is clicked", async () => {
    const sampleItems = [{ _id: "1", name: "Latte" }];
    api.get.mockResolvedValueOnce({ data: sampleItems });

    render(<Menu />);
    const item = await screen.findByTestId("menu-item");
    fireEvent.click(item);
    expect(mockAddToCart).toHaveBeenCalledWith(sampleItems[0]);
  });

  test("handles API error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("Network error"));
    render(<Menu />);
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
