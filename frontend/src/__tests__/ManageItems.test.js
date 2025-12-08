import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ManageItems from "../pages/admin/ManageItems";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

// Mocks
jest.mock("../api/axios", () => ({
	get: jest.fn(),
	patch: jest.fn(),
}));

jest.mock("../context/CartContext", () => ({
	useCart: jest.fn(),
}));

const sampleItems = [
	{
		_id: "item1",
		name: "Coffee",
		price: 3.5,
		description: "Fresh brewed coffee",
		available: true,
		image: "/coffee.jpg",
	},
	{
		_id: "item2",
		name: "Sandwich",
		price: 5.0,
		description: "Turkey sandwich",
		available: false,
		image: null,
	},
];

describe("📦 ManageItems", () => {
	const mockFetchCart = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		useCart.mockReturnValue({ fetchCart: mockFetchCart });
		api.get.mockResolvedValue({ data: sampleItems });
	});

	test("renders loading state initially", () => {
		api.get.mockReturnValue(new Promise(() => { }));
		render(<ManageItems />);
		expect(screen.getByText(/Loading items/i)).toBeInTheDocument();
	});

	test("renders menu items after loading", async () => {
		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Coffee")).toBeInTheDocument();
		});

		expect(screen.getByText("Sandwich")).toBeInTheDocument();
		expect(screen.getByText("$3.50")).toBeInTheDocument();
		expect(screen.getByText("$5.00")).toBeInTheDocument();
	});

	test("displays availability status for items", async () => {
		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Coffee")).toBeInTheDocument();
		});

		// Coffee is available, Sandwich is unavailable
		expect(screen.getByText("Available")).toBeInTheDocument();
		expect(screen.getByText("Unavailable")).toBeInTheDocument();
	});

	test("renders toggle buttons with correct text", async () => {
		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Coffee")).toBeInTheDocument();
		});

		// Available item shows "Mark Unavailable"
		expect(screen.getByText("Mark Unavailable")).toBeInTheDocument();
		// Unavailable item shows "Make Available"
		expect(screen.getByText("Make Available")).toBeInTheDocument();
	});

	test("toggles item availability - archive", async () => {
		api.patch.mockResolvedValueOnce({
			data: { item: { _id: "item1", available: false } },
		});

		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Coffee")).toBeInTheDocument();
		});

		// Click "Mark Unavailable" on Coffee
		fireEvent.click(screen.getByText("Mark Unavailable"));

		await waitFor(() => {
			expect(api.patch).toHaveBeenCalledWith("/menu/item1/archive");
		});

		expect(mockFetchCart).toHaveBeenCalled();
	});

	test("toggles item availability - restore", async () => {
		api.patch.mockResolvedValueOnce({
			data: { item: { _id: "item2", available: true } },
		});

		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Sandwich")).toBeInTheDocument();
		});

		// Click "Make Available" on Sandwich
		fireEvent.click(screen.getByText("Make Available"));

		await waitFor(() => {
			expect(api.patch).toHaveBeenCalledWith("/menu/item2/restore");
		});
	});

	test("displays error message when API fails", async () => {
		api.get.mockRejectedValueOnce(new Error("Failed to load"));

		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText(/Failed to load menu items/i)).toBeInTheDocument();
		});
	});

	test("shows description when available", async () => {
		render(<ManageItems />);

		await waitFor(() => {
			expect(screen.getByText("Coffee")).toBeInTheDocument();
		});

		expect(screen.getByText("Fresh brewed coffee")).toBeInTheDocument();
		expect(screen.getByText("Turkey sandwich")).toBeInTheDocument();
	});
});
