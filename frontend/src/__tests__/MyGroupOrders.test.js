// frontend/src/__tests__/MyGroupOrders.test.jsx
// Adjust the import path based on your project structure.
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MyGroupOrders from "../components/MyGroupOrders";

jest.mock("axios");

describe("MyGroupOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a list of group orders returned from the API", async () => {
    const mockGroupOrders = [
      {
        _id: "go1",
        shareCode: "ABC123",
        status: "open",
        subtotal: 12.0,
        total: 12.96,
        creator: { _id: "user1", name: "Alice" },
        participants: [
          { user: { _id: "user1", name: "Alice" }, items: [] },
          { user: { _id: "user2", name: "Bob" }, items: [] },
        ],
      },
      {
        _id: "go2",
        shareCode: "XYZ789",
        status: "completed",
        subtotal: 20.0,
        total: 21.6,
        creator: { _id: "user2", name: "Bob" },
        participants: [
          { user: { _id: "user2", name: "Bob" }, items: [] },
        ],
      },
    ];

    axios.get.mockResolvedValueOnce({
      data: { groupOrders: mockGroupOrders },
    });

    render(<MyGroupOrders />);

    // Optional: if you show a loading state
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      // Check that shareCodes / statuses are rendered
      expect(screen.getByText(/abc123/i)).toBeInTheDocument();
      expect(screen.getByText(/open/i)).toBeInTheDocument();

      expect(screen.getByText(/xyz789/i)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    // Make sure the correct API endpoint was called
    expect(axios.get).toHaveBeenCalledWith("/api/group-orders/mine");
  });

  it("shows an empty state if there are no group orders", async () => {
    axios.get.mockResolvedValueOnce({
      data: { groupOrders: [] },
    });

    render(<MyGroupOrders />);

    await waitFor(() => {
      // Adjust the text to whatever you show on empty state
      expect(
        screen.getByText(/no group orders yet/i)
      ).toBeInTheDocument();
    });
  });

  it("shows an error message if the API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(<MyGroupOrders />);

    await waitFor(() => {
      // Adjust text to your actual error UI
      expect(
        screen.getByText(/failed to load group orders/i)
      ).toBeInTheDocument();
    });
  });
});
