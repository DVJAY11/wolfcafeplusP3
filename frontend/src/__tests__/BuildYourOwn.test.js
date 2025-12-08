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

jest.mock("../context/ModalContext", () => ({
	useModal: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BuildYourOwn from "../pages/BuildYourOwn";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useNavigate } from "react-router-dom";

describe("🛠️ Build Your Own Page", () => {
	const mockAddToCart = jest.fn();
	const mockFetchCart = jest.fn();
	const mockShowLoginModal = jest.fn();
	const mockNavigate = jest.fn();

	// Helper to render with AuthContext
	const renderWithAuth = (ui, user = { _id: "user1", name: "Test User" }) => {
		return render(
			<AuthContext.Provider value={ { user } }>
				{ ui }
			</AuthContext.Provider>
		);
	};

	const sampleMenuItems = [
		{ _id: "menu1", name: "Coffee", price: 3.0, available: true, itemGroup: "drink" },
		{ _id: "menu2", name: "Sandwich", price: 5.0, available: true, itemGroup: "main" },
		{ _id: "menu3", name: "Cookie", price: 2.0, available: true, itemGroup: "side" },
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
			applicableFor: ["drink"],
		},
		{
			_id: "ing2",
			name: "Whole Milk",
			price: 0.5,
			category: "dairy",
			available: true,
			allergens: ["dairy"],
			dietaryTags: [],
			applicableFor: ["drink"],
		},
		{
			_id: "ing3",
			name: "Cheese",
			price: 1.0,
			category: "dairy",
			available: true,
			allergens: ["dairy"],
			dietaryTags: [],
			applicableFor: ["main"],
		},
	];

describe("BuildYourOwn (Meal Builder)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useCart.mockReturnValue({ addToCart: mockAddToCart, fetchCart: mockFetchCart });
		useModal.mockReturnValue({ showLoginModal: mockShowLoginModal });
		useNavigate.mockReturnValue(mockNavigate);

		api.get.mockImplementation((url) => {
			if (url === "/menu?all=true") {
				return Promise.resolve({
					data: [
						{ _id: "d1", name: "Green Tea", price: 3.0, itemGroup: "drink", available: true, description: "Hot tea" },
						{ _id: "m1", name: "Burger", price: 10.0, itemGroup: "main", available: true },
						{ _id: "s1", name: "Fries", price: 4.0, itemGroup: "side", available: true },
					]
				});
			}
			if (url === "/ingredients") {
				return Promise.resolve({
					data: {
						ingredients: [
							{ _id: "i1", name: "Sugar", price: 0.5, category: "flavoring", applicableFor: ["drink"], available: true },
							{ _id: "i2", name: "Cheese", price: 1.0, category: "topping", applicableFor: ["main"], available: true },
						]
					}
				});
			}
			return Promise.reject(new Error("Unknown URL"));
		});
		api.post.mockResolvedValue({ data: {} });
	});

	// ==================== CORE TESTS ====================

	test("renders loading state initially", () => {
		renderWithAuth(<BuildYourOwn />);
		expect(screen.getByText(/Loading menu/i)).toBeInTheDocument();
	});

	test("renders step 1 (drink selection) after loading", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText(/Choose Your Drink/i)).toBeInTheDocument()
		);
		expect(screen.getByText("Coffee")).toBeInTheDocument();
	});

	test("shows progress bar with all steps", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		expect(screen.getByText("Drink")).toBeInTheDocument();
		expect(screen.getByText("Main")).toBeInTheDocument();
		expect(screen.getByText("Side")).toBeInTheDocument();
		expect(screen.getByText("Review")).toBeInTheDocument();
	});

	test("allows selecting a drink and proceeding to main step", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Click Next
		const nextButton = screen.getByText(/Next →/i);
		fireEvent.click(nextButton);

		// Should be on step 2
		await waitFor(() =>
			expect(screen.getByText(/Choose Your Main/i)).toBeInTheDocument()
		);
		expect(screen.getByText("Sandwich")).toBeInTheDocument();
	});

	test("Next button is disabled when no base item is selected", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		const nextButton = screen.getByText(/Next →/i);
		expect(nextButton).toBeDisabled();
	});

	test("Next button is enabled after selecting a base item", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		const nextButton = screen.getByText(/Next →/i);
		expect(nextButton).not.toBeDisabled();
	});

	test("Skip button advances to next step and clears selection", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee first
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Click Skip
		const skipButton = screen.getByText(/Skip/i);
		fireEvent.click(skipButton);

		// Should be on step 2
		await waitFor(() =>
			expect(screen.getByText(/Choose Your Main/i)).toBeInTheDocument()
		);
	});

	test("can navigate to any step via progress bar", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Click step 3 in progress bar
		const step3Button = screen.getByText("3").closest("button");
		fireEvent.click(step3Button);

		await waitFor(() =>
			expect(screen.getByText(/Choose Your Side/i)).toBeInTheDocument()
		);
		expect(screen.getByText("Cookie")).toBeInTheDocument();
	});

	test("can navigate to review step via progress bar", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Click step 4 in progress bar
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Review Your Meal/i)).toBeInTheDocument()
		);
	});

	test("Back button appears on steps after step 1", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// On step 1, Back button should NOT be present
		expect(screen.queryByText("Back")).not.toBeInTheDocument();

		// Go to step 2
		const step2Button = screen.getByText("2").closest("button");
		fireEvent.click(step2Button);

		await waitFor(() =>
			expect(screen.getByText(/Choose Your Main/i)).toBeInTheDocument()
		);

		// Now Back button should be present
		expect(screen.getByText("Back")).toBeInTheDocument();
	});

	test("Back button navigates to previous step", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 2
		const step2Button = screen.getByText("2").closest("button");
		fireEvent.click(step2Button);

		await waitFor(() =>
			expect(screen.getByText(/Choose Your Main/i)).toBeInTheDocument()
		);

		// Click Back
		const backButton = screen.getByText("Back");
		fireEvent.click(backButton);

		// Should be on step 1
		await waitFor(() =>
			expect(screen.getByText(/Choose Your Drink/i)).toBeInTheDocument()
		);
	});

	test("review step shows Add Meal to Cart button", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to review step
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Add Meal to Cart/i)).toBeInTheDocument()
		);
	});

	test("shows login modal when adding to cart without being logged in", async () => {
		// Render without user
		render(
			<AuthContext.Provider value={ { user: null } }>
				<BuildYourOwn />
			</AuthContext.Provider>
		);

		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Add Meal to Cart/i)).toBeInTheDocument()
		);

		// Click Add to Cart
		const addButton = screen.getByText(/Add Meal to Cart/i);
		fireEvent.click(addButton);

		expect(mockShowLoginModal).toHaveBeenCalled();
	});

	test("adds meal to cart and navigates to cart page", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Add Meal to Cart/i)).toBeInTheDocument()
		);

		// Click Add to Cart
		const addButton = screen.getByText(/Add Meal to Cart/i);
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith("/cart", expect.any(Object));
		});

		await waitFor(() => {
			expect(mockFetchCart).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/cart");
		});
	});

	// ==================== BYO-SPECIFIC TESTS ====================

	test("BYO-1: sides step does not show customization panel", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to step 3 (Side)
		const step3Button = screen.getByText("3").closest("button");
		fireEvent.click(step3Button);

		await waitFor(() =>
			expect(screen.getByText(/Choose Your Side/i)).toBeInTheDocument()
		);

		// Should NOT show the "Customize" text since sides don't have customizations
		expect(screen.queryByText(/Customize/i)).not.toBeInTheDocument();
	});

	test("BYO-2: review step displays selected items", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);
	};

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Review Your Meal/i)).toBeInTheDocument()
		);

		// Should display section labels
		expect(screen.getByText("drink")).toBeInTheDocument();
		expect(screen.getByText("main")).toBeInTheDocument();
		expect(screen.getByText("side")).toBeInTheDocument();

		// Should show Coffee as the selected drink
		expect(screen.getByText("Coffee")).toBeInTheDocument();
	});

	test("BYO-3: review step shows total price", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee ($3.00)
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Review Your Meal/i)).toBeInTheDocument()
		);

		// Should show total
		expect(screen.getByText(/Total:/i)).toBeInTheDocument();
		// Price may appear in multiple places (card and total), just check it exists
		const priceElements = screen.getAllByText("$3.00");
		expect(priceElements.length).toBeGreaterThan(0);
	});

	test("BYO-4: mealGroupId is included when adding to cart", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Select Coffee
		const coffeeOption = screen.getByText("Coffee").closest("div");
		fireEvent.click(coffeeOption);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Add Meal to Cart/i)).toBeInTheDocument()
		);

		// Click Add to Cart
		const addButton = screen.getByText(/Add Meal to Cart/i);
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(api.post).toHaveBeenCalled();
		});

		// Verify mealGroupId is in the payload
		const callArgs = api.post.mock.calls[0][1];
		expect(callArgs.items).toBeDefined();
		expect(callArgs.items[0].mealGroupId).toBeDefined();
		expect(callArgs.items[0].mealGroupId.length).toBeGreaterThan(0);
	});

	test("BYO-5: review step has Edit buttons for each section", async () => {
		renderWithAuth(<BuildYourOwn />);
		await waitFor(() =>
			expect(screen.getByText("Coffee")).toBeInTheDocument()
		);

		// Go to review
		const step4Button = screen.getByText("4").closest("button");
		fireEvent.click(step4Button);

		await waitFor(() =>
			expect(screen.getByText(/Review Your Meal/i)).toBeInTheDocument()
		);

		// Should show Edit buttons
		const editButtons = screen.getAllByText("Edit");
		expect(editButtons.length).toBe(3); // One for drink, main, side
	});
});
