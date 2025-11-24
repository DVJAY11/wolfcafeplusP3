jest.mock("../api/axios", () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		post: jest.fn(),
	},
}));

jest.mock("../context/CartContext", () => ({
	useCart: jest.fn(),
}));

// Removed AuthContext mock to use real context with Provider

jest.mock("../context/ModalContext", () => ({
	useModal: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: jest.fn(),
}));

jest.mock("../components/IngredientSelector", () => (props) => (
	<div
		data-testid={ `ingredient-${props.ingredient._id}` }
		onClick={ () => props.onToggle(props.ingredient._id) }
		data-selected={ props.isSelected }
		data-disabled={ props.disabled }
	>
		{ props.ingredient.name } - ${ props.ingredient.price }
	</div>
));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BuildYourOwn from "../pages/BuildYourOwn";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useNavigate } from "react-router-dom";

describe("🛠️ Build Your Own Page", () => {
	const mockAddToCart = jest.fn();
	const mockNavigate = jest.fn();
	const mockShowLoginModal = jest.fn();

	// Helper to render with AuthContext
	const renderWithAuth = (ui, user = { _id: "user1", name: "Test User" }) => {
		return render(
			<AuthContext.Provider value={ { user } }>
				{ ui }
			</AuthContext.Provider>
		);
	};

	const sampleMenuItems = [
		{ _id: "menu1", name: "Coffee", price: 3.0, available: true },
		{ _id: "menu2", name: "Sandwich", price: 5.0, available: true },
	];

	const sampleIngredients = [
		{
			_id: "ing1",
			name: "Vanilla Syrup",
			price: 0.5,
			category: "flavoring",
			available: true,
			allergens: [],
			dietaryTags: ["vegan"],
		},
		{
			_id: "ing2",
			name: "Whole Milk",
			price: 0.5,
			category: "dairy",
			available: true,
			allergens: ["dairy"],
			dietaryTags: [],
		},
		{
			_id: "ing3",
			name: "Almond Milk",
			price: 0.75,
			category: "dairy",
			available: true,
			allergens: ["nuts"],
			dietaryTags: ["vegan", "dairy-free"],
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		useCart.mockReturnValue({ addToCart: mockAddToCart });
		// useAuth mock removed
		useModal.mockReturnValue({ showLoginModal: mockShowLoginModal });
		useNavigate.mockReturnValue(mockNavigate);

		api.get.mockImplementation((url) => {
			if (url === "/menu?all=true") {
				return Promise.resolve({ data: sampleMenuItems });
			}
			if (url === "/ingredients") {
				return Promise.resolve({ data: { ingredients: sampleIngredients } });
			}
			return Promise.reject(new Error("Unknown URL"));
		});

		api.post.mockResolvedValue({ data: {} });
	});

	test("renders loading state initially", () => {
		render(<BuildYourOwn />);
		expect(screen.getByText(/Loading/i)).toBeInTheDocument();
	});

	test("renders step 1 (base selection) after loading", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText(/Step 1: Choose Your Base/i)).toBeInTheDocument()
		);
		expect(screen.getByText(/Start from Scratch/i)).toBeInTheDocument();
		expect(screen.getByText("Coffee")).toBeInTheDocument();
		expect(screen.getByText("Sandwich")).toBeInTheDocument();
	});

	test("allows selecting a base item and proceeding to step 2", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Click Next
		const nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		// Should be on step 2
		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);
	});

	test("allows selecting ingredients in step 2", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 2
		const nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Select Vanilla Syrup
		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		// Should show selected count
		expect(screen.getByText(/selected: 1/i)).toBeInTheDocument();
	});

	test("calculates total price correctly", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee ($3.00)
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to step 2
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Select Vanilla Syrup ($0.50)
		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		// Go to step 3
		nextButton = screen.getByText(/Next: Dietary Filters/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 3: Dietary Restrictions & Summary/i)).toBeInTheDocument()
		);

		// Should show total: $3.50
		expect(screen.getByText(/Total: \$3\.50/i)).toBeInTheDocument();
	});

	test("allows toggling dietary restrictions", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 2
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Select ingredient
		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		// Go to step 3
		nextButton = screen.getByText(/Next: Dietary Filters/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 3: Dietary Restrictions & Summary/i)).toBeInTheDocument()
		);

		// Toggle vegan filter
		const veganButton = screen.getByText("vegan");
		fireEvent.click(veganButton);

		// Should show checkmark
		expect(screen.getByText(/✓ vegan/i)).toBeInTheDocument();
	});

	test("calls API to add custom item to cart", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to step 2
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Select Vanilla Syrup
		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		// Go to step 3
		nextButton = screen.getByText(/Next: Dietary Filters/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 3: Dietary Restrictions & Summary/i)).toBeInTheDocument()
		);

		// Click Add to Cart
		const addButton = screen.getByText(/Add to Cart/i);
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith(
				"/cart",
				expect.objectContaining({
					menuItem: "menu1",
					quantity: 1,
					customizations: expect.arrayContaining([
						expect.objectContaining({
							ingredientId: "ing1",
							name: "Vanilla Syrup",
							price: 0.5,
						}),
					]),
				})
			);
		});

		expect(mockNavigate).toHaveBeenCalledWith("/cart");
	});

	test("shows login modal if user not authenticated when adding to cart", async () => {
		renderWithAuth(<BuildYourOwn />, null);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go through steps quickly
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		nextButton = screen.getByText(/Next: Dietary Filters/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 3: Dietary Restrictions & Summary/i)).toBeInTheDocument()
		);

		const addButton = screen.getByText(/Add to Cart/i);
		fireEvent.click(addButton);

		expect(mockShowLoginModal).toHaveBeenCalled();
		expect(api.post).not.toHaveBeenCalledWith("/cart", expect.anything());
	});

	test("allows saving custom item with name", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go through steps
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		const vanillaOption = screen.getByTestId("ingredient-ing1");
		fireEvent.click(vanillaOption);

		nextButton = screen.getByText(/Next: Dietary Filters/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 3: Dietary Restrictions & Summary/i)).toBeInTheDocument()
		);

		// Enter custom name
		const nameInput = screen.getByPlaceholderText(/Enter a name/i);
		fireEvent.change(nameInput, { target: { value: "My Favorite" } });

		// Click Save
		const saveButton = screen.getByText(/Save Custom Item/i);
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith(
				"/custom-items",
				expect.objectContaining({
					name: "My Favorite",
					ingredients: ["ing1"],
				})
			);
		});
	});

	test("validates that at least one ingredient is selected", async () => {
		window.alert = jest.fn();

		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 2 without selecting ingredients
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Try to go to step 3 without selecting anything - button should be disabled
		nextButton = screen.getByText(/Next: Dietary Filters/i);
		expect(nextButton).toBeDisabled();
	});

	test("handles API errors gracefully", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
		api.get.mockRejectedValueOnce(new Error("Network error"));

		render(<BuildYourOwn />);
		await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
		consoleSpy.mockRestore();
	});

	test("allows navigating back between steps", async () => {
		render(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 2
		let nextButton = screen.getByText(/Next: Choose Ingredients/i);
		fireEvent.click(nextButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 2: Select Your Ingredients/i)).toBeInTheDocument()
		);

		// Go back to step 1
		const backButton = screen.getByText(/← Back/i);
		fireEvent.click(backButton);

		await waitFor(() =>
			expect(screen.getByText(/Step 1: Choose Your Base/i)).toBeInTheDocument()
		);
	});
});
