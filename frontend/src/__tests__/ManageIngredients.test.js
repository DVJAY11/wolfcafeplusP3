import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ManageIngredients from "../pages/admin/ManageIngredients";
import api from "../api/axios";

// Mock axios
jest.mock("../api/axios", () => ({
	get: jest.fn(),
	post: jest.fn(),
	put: jest.fn(),
	delete: jest.fn(),
}));

// Mock window.confirm and window.alert
const originalConfirm = window.confirm;
const originalAlert = window.alert;

const sampleIngredients = [
	{
		_id: "ing1",
		name: "Vanilla Syrup",
		price: 0.5,
		category: "flavoring",
		available: true,
		allergens: ["gluten"],
		dietaryTags: ["vegan"],
		image: "/vanilla.jpg",
	},
	{
		_id: "ing2",
		name: "Whole Milk",
		price: 0.5,
		category: "dairy",
		available: false,
		allergens: ["dairy"],
		dietaryTags: [],
		image: null,
	},
];

describe("🧂 ManageIngredients", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		window.confirm = jest.fn(() => true);
		window.alert = jest.fn();
		api.get.mockResolvedValue({ data: { ingredients: sampleIngredients } });
	});

	afterEach(() => {
		window.confirm = originalConfirm;
		window.alert = originalAlert;
	});

	test("renders loading state initially", () => {
		api.get.mockReturnValue(new Promise(() => { }));
		render(<ManageIngredients />);
		expect(screen.getByText(/Loading ingredients/i)).toBeInTheDocument();
	});

	test("renders ingredients table after loading", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		expect(screen.getByText("Whole Milk")).toBeInTheDocument();
		// Use getAllByText since multiple ingredients have the same price
		const priceElements = screen.getAllByText("$0.50");
		expect(priceElements.length).toBeGreaterThan(0);
	});

	test("displays availability status for ingredients", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		expect(screen.getByText("Available")).toBeInTheDocument();
		expect(screen.getByText("Unavailable")).toBeInTheDocument();
	});

	test("displays allergens and dietary tags", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		expect(screen.getByText("gluten")).toBeInTheDocument();
		// 'dairy' appears multiple times (allergen and category)
		const dairyElements = screen.getAllByText("dairy");
		expect(dairyElements.length).toBeGreaterThan(0);
		expect(screen.getByText("vegan")).toBeInTheDocument();
	});

	test("shows Add Ingredient button", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		expect(screen.getByText("+ Add Ingredient")).toBeInTheDocument();
	});

	test("toggles add form visibility when clicking button", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		// Click to show form
		fireEvent.click(screen.getByText("+ Add Ingredient"));
		expect(screen.getByText("Add New Ingredient")).toBeInTheDocument();

		// Click to hide form - there are 2 Cancel buttons, click the first one (header button)
		const cancelButtons = screen.getAllByText("Cancel");
		fireEvent.click(cancelButtons[0]);
		expect(screen.queryByText("Add New Ingredient")).not.toBeInTheDocument();
	});

	test("toggles ingredient availability", async () => {
		api.put.mockResolvedValueOnce({ data: {} });

		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		// Click Disable on available ingredient
		const disableButtons = screen.getAllByText("Disable");
		fireEvent.click(disableButtons[0]);

		await waitFor(() => {
			expect(api.put).toHaveBeenCalledWith("/ingredients/ing1", {
				available: false,
			});
		});
	});

	test("enables unavailable ingredient", async () => {
		api.put.mockResolvedValueOnce({ data: {} });

		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Whole Milk")).toBeInTheDocument();
		});

		// Click Enable on unavailable ingredient
		const enableButton = screen.getByText("Enable");
		fireEvent.click(enableButton);

		await waitFor(() => {
			expect(api.put).toHaveBeenCalledWith("/ingredients/ing2", {
				available: true,
			});
		});
	});

	test("deletes ingredient after confirmation", async () => {
		api.delete.mockResolvedValueOnce({ data: {} });

		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		// Click Delete
		const deleteButtons = screen.getAllByText("Delete");
		fireEvent.click(deleteButtons[0]);

		expect(window.confirm).toHaveBeenCalled();

		await waitFor(() => {
			expect(api.delete).toHaveBeenCalledWith("/ingredients/ing1");
		});
	});

	test("displays error when API fails", async () => {
		api.get.mockRejectedValueOnce(new Error("Failed to load"));

		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText(/Failed to load ingredients/i)).toBeInTheDocument();
		});
	});

	test("renders table headers", async () => {
		render(<ManageIngredients />);

		await waitFor(() => {
			expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		});

		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Category")).toBeInTheDocument();
		expect(screen.getByText("Price")).toBeInTheDocument();
		expect(screen.getByText("Allergens")).toBeInTheDocument();
		expect(screen.getByText("Dietary Tags")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Actions")).toBeInTheDocument();
	});
});
