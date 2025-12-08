import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ManageOrders from "../pages/admin/ManageOrders";
import axios from "../api/axios";

// Mock axios
jest.mock("../api/axios", () => ({
	get: jest.fn(),
	patch: jest.fn(),
}));

const sampleOrders = [
	{
		_id: "order1",
		status: "pending",
		user: { name: "John Doe" },
		items: [
			{ menuItem: { name: "Coffee" }, quantity: 2 },
			{ menuItem: { name: "Muffin" }, quantity: 1 },
		],
	},
	{
		_id: "order2",
		status: "in_progress",
		user: { name: "Jane Smith" },
		items: [{ menuItem: { name: "Sandwich" }, quantity: 1 }],
	},
	{
		_id: "order3",
		status: "ready",
		user: { name: "Bob Wilson" },
		items: [{ menuItem: { name: "Latte" }, quantity: 1 }],
	},
	{
		_id: "order4",
		status: "completed",
		user: { name: "Alice Brown" },
		items: [{ menuItem: { name: "Cookie" }, quantity: 3 }],
	},
];

describe("📋 ManageOrders", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		axios.get.mockResolvedValue({ data: sampleOrders });
	});

	test("renders loading state initially", () => {
		axios.get.mockReturnValue(new Promise(() => { }));
		render(<ManageOrders />);
		expect(screen.getByText(/Loading orders/i)).toBeInTheDocument();
	});

	test("renders all order status sections after loading", async () => {
		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText(/Manage Orders/i)).toBeInTheDocument();
		});

		// Check all section headers
		expect(screen.getByText(/Pending Orders/i)).toBeInTheDocument();
		expect(screen.getByText(/In Progress Orders/i)).toBeInTheDocument();
		expect(screen.getByText(/Ready for Pickup/i)).toBeInTheDocument();
		expect(screen.getByText(/Completed Orders/i)).toBeInTheDocument();
	});

	test("displays orders in correct status sections", async () => {
		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText("John Doe")).toBeInTheDocument();
		});

		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
		expect(screen.getByText("Alice Brown")).toBeInTheDocument();
	});

	test("displays order items correctly", async () => {
		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText(/Coffee ×2/i)).toBeInTheDocument();
		});

		expect(screen.getByText(/Muffin ×1/i)).toBeInTheDocument();
		expect(screen.getByText(/Sandwich ×1/i)).toBeInTheDocument();
	});

	test("calls API to fetch orders on mount", async () => {
		render(<ManageOrders />);

		await waitFor(() => {
			expect(axios.get).toHaveBeenCalledWith("/orders");
		});
	});

	test("renders status dropdowns for each order", async () => {
		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText("John Doe")).toBeInTheDocument();
		});

		// Find all status dropdowns (should be 4 orders = 4 comboboxes)
		const dropdowns = screen.getAllByRole("combobox");
		expect(dropdowns.length).toBe(4);
	});

	test("changes order status on dropdown change", async () => {
		axios.patch.mockResolvedValueOnce({
			data: { _id: "order1", status: "in_progress", user: { name: "John Doe" }, items: [] },
		});

		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText("John Doe")).toBeInTheDocument();
		});

		// Find the first dropdown (pending order)
		const dropdowns = screen.getAllByRole("combobox");
		fireEvent.change(dropdowns[0], { target: { value: "in_progress" } });

		await waitFor(() => {
			expect(axios.patch).toHaveBeenCalledWith("/orders/order1", {
				status: "in_progress",
			});
		});
	});

	test("handles empty orders gracefully", async () => {
		axios.get.mockResolvedValueOnce({ data: [] });

		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText(/Manage Orders/i)).toBeInTheDocument();
		});

		// Should show "No orders in this category" for all sections
		const noOrdersMessages = screen.getAllByText(/No orders in this category/i);
		expect(noOrdersMessages.length).toBe(4);
	});

	test("handles API error gracefully", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
		axios.get.mockRejectedValueOnce(new Error("Network error"));

		render(<ManageOrders />);

		await waitFor(() => {
			expect(screen.getByText(/Manage Orders/i)).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});
});
