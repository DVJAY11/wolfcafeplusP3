// frontend/src/__tests__/GroupOrderSession.test.jsx
// Adjust the import path based on where your component actually lives.
// ✅ Put this at the TOP of GroupOrderSession.test.js
jest.mock("axios", () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
    },
    get: jest.fn(),
    post: jest.fn(),
  }));
  
  import axios from "axios";

  
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import GroupOrderSession from "../components/GroupOrderSession";

jest.mock("axios");

describe("GroupOrderSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts a new group order when 'Start Group Order' is clicked", async () => {
    const mockGroupOrder = {
      _id: "go123",
      shareCode: "ABC123",
      status: "open",
      participants: [
        {
          user: { _id: "user1", name: "Alice" },
          items: [],
        },
      ],
      subtotal: 0,
      total: 0,
    };

    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockGroupOrder },
    });

    render(<GroupOrderSession />);

    const startButton = screen.getByRole("button", {
      name: /start group order/i,
    });

    fireEvent.click(startButton);

    expect(axios.post).toHaveBeenCalledWith("/api/group-orders");

    // After the promise resolves, the share code should be shown
    await waitFor(() => {
      expect(screen.getByText(/share code/i)).toBeInTheDocument();
      expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
    });
  });

  it("joins an existing group order using a share code", async () => {
    const mockGroupOrder = {
      _id: "go456",
      shareCode: "JOIN99",
      status: "open",
      participants: [
        {
          user: { _id: "user1", name: "Alice" },
          items: [],
        },
        {
          user: { _id: "user2", name: "Bob" },
          items: [],
        },
      ],
      subtotal: 0,
      total: 0,
    };

    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockGroupOrder },
    });

    render(<GroupOrderSession />);

    const shareCodeInput = screen.getByPlaceholderText(/enter share code/i);
    const joinButton = screen.getByRole("button", {
      name: /join group order/i,
    });

    fireEvent.change(shareCodeInput, { target: { value: "JOIN99" } });
    fireEvent.click(joinButton);

    expect(axios.post).toHaveBeenCalledWith("/api/group-orders/JOIN99/join");

    await waitFor(() => {
      // Shows participants after joining
      expect(screen.getByText(/alice/i)).toBeInTheDocument();
      expect(screen.getByText(/bob/i)).toBeInTheDocument();
    });
  });

  it("allows adding an item to the group order", async () => {
    // First, component is in a state where a group order is already active.
    // We simulate that by mocking the initial group order creation.
    const mockInitialGroupOrder = {
      _id: "go789",
      shareCode: "ITEM01",
      status: "open",
      participants: [
        {
          user: { _id: "user2", name: "Bob" },
          items: [],
        },
      ],
      subtotal: 0,
      total: 0,
    };

    const mockAfterAddItem = {
      ...mockInitialGroupOrder,
      subtotal: 12.0,
      total: 12.96,
      participants: [
        {
          user: { _id: "user2", name: "Bob" },
          items: [
            {
              _id: "lineItem1",
              quantity: 2,
              menuItem: {
                _id: "menu1",
                name: "Avocado Toast",
                price: 6.0,
              },
            },
          ],
        },
      ],
    };

    // 1st POST: start group order
    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockInitialGroupOrder },
    });

    render(<GroupOrderSession />);

    const startButton = screen.getByRole("button", {
      name: /start group order/i,
    });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/item01/i)).toBeInTheDocument();
    });

    // 2nd POST: add item
    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockAfterAddItem },
    });

    // Assuming you have:
    // - a select or input to choose a menu item
    // - an input for quantity
    // - a button "Add Item"
    // Adjust selectors to your real UI.

    const menuSelect = screen.getByLabelText(/menu item/i);
    const quantityInput = screen.getByLabelText(/quantity/i);
    const addButton = screen.getByRole("button", { name: /add item/i });

    fireEvent.change(menuSelect, { target: { value: "menu1" } });
    fireEvent.change(quantityInput, { target: { value: "2" } });
    fireEvent.click(addButton);

    expect(axios.post).toHaveBeenCalledWith("/api/group-orders/go789/items", {
      menuItemId: "menu1",
      quantity: 2,
      customizations: [],
    });

    await waitFor(() => {
      expect(screen.getByText(/avocado toast/i)).toBeInTheDocument();
      expect(screen.getByText(/x 2/i)).toBeInTheDocument();
    });
  });

  it("finalizes the group order", async () => {
    const mockInitialGroupOrder = {
      _id: "go999",
      shareCode: "FINAL1",
      status: "open",
      participants: [],
      subtotal: 10,
      total: 10.8,
    };

    const mockCompletedGroupOrder = {
      ...mockInitialGroupOrder,
      status: "completed",
    };

    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockInitialGroupOrder },
    });

    render(<GroupOrderSession />);

    const startButton = screen.getByRole("button", {
      name: /start group order/i,
    });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/final1/i)).toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: { groupOrder: mockCompletedGroupOrder },
    });

    const finalizeButton = screen.getByRole("button", {
      name: /finalize order/i,
    });
    fireEvent.click(finalizeButton);

    expect(axios.post).toHaveBeenCalledWith("/api/group-orders/go999/finalize");

    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });
});
