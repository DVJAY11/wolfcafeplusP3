// frontend/src/__tests__/GroupOrderSession.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GroupOrderSession from "../pages/GroupOrderSession";

// Mock router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ shareCode: "TEST1234" }),
  Link: ({ children }) => <div>{ children }</div>
}));

// Mock Context
const mockFetchGroupOrderByShareCode = jest.fn();
const mockLeaveGroupOrder = jest.fn();
const mockFinalizeGroupOrder = jest.fn();

let mockGroupOrderValue = null;

jest.mock("../context/GroupOrderContext", () => ({
  useGroupOrder: () => ({
    groupOrder: mockGroupOrderValue,
    fetchGroupOrderByShareCode: mockFetchGroupOrderByShareCode,
    leaveGroupOrder: mockLeaveGroupOrder,
    finalizeGroupOrder: mockFinalizeGroupOrder,
  }),
}));

describe("GroupOrderSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGroupOrderValue = null;
  });

  it("fetches group order on mount and shows loading", async () => {
    mockFetchGroupOrderByShareCode.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<GroupOrderSession />);
    expect(screen.getByText(/loading group order/i)).toBeInTheDocument();
    expect(mockFetchGroupOrderByShareCode).toHaveBeenCalledWith("TEST1234");
  });

  it("shows error if group order fetch fails/not found", async () => {
    mockFetchGroupOrderByShareCode.mockRejectedValue(new Error("Not found"));
    render(<GroupOrderSession />);

    await waitFor(() => {
      expect(screen.getByText(/couldn’t find a group order/i)).toBeInTheDocument();
    });
  });

  it("renders group order details when loaded", async () => {
    mockGroupOrderValue = {
      _id: "123",
      shareCode: "TEST1234",
      status: "open",
      subtotal: 10,
      tax: 1,
      tip: 2,
      total: 13,
      participants: [
        {
          user: { _id: "u1", name: "Alice" },
          items: [
            { _id: "i1", menuItem: { name: "Coffee", price: 5 }, quantity: 1, customizations: [] }
          ]
        }
      ]
    };
    mockFetchGroupOrderByShareCode.mockResolvedValue(true);

    render(<GroupOrderSession />);

    // Should wait for loading to finish
    // The component sets loading=false via finally block

    await waitFor(() => {
      expect(screen.getByText("Group Order Session")).toBeInTheDocument();
      expect(screen.getByText("TEST1234")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText(/Coffee/i)).toBeInTheDocument();
      expect(screen.getByText(/Total: \$13.00/i)).toBeInTheDocument();
    });
  });

  it("allows finalizing the order if open", async () => {
    mockGroupOrderValue = {
      shareCode: "TEST1234",
      status: "open",
      participants: []
    };
    mockFetchGroupOrderByShareCode.mockResolvedValue(true);
    mockFinalizeGroupOrder.mockResolvedValue(true);
    window.alert = jest.fn(); // Mock alert

    render(<GroupOrderSession />);

    await waitFor(() => screen.getByText("Finalize Order"));

    const finalizeBtn = screen.getByText("Finalize Order");
    fireEvent.click(finalizeBtn);

    expect(mockFinalizeGroupOrder).toHaveBeenCalled();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Group order finalized!"));
  });

  it("allows leaving the group", async () => {
    mockGroupOrderValue = {
      shareCode: "TEST1234",
      status: "open",
      participants: []
    };
    mockFetchGroupOrderByShareCode.mockResolvedValue(true);
    mockLeaveGroupOrder.mockResolvedValue(true);

    render(<GroupOrderSession />);

    await waitFor(() => screen.getByText("Leave Group"));

    const leaveBtn = screen.getByText("Leave Group");
    fireEvent.click(leaveBtn);

    expect(mockLeaveGroupOrder).toHaveBeenCalled();
  });
});
