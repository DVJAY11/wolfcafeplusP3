// 🚨 Mock axios before importing component
jest.mock("../api/axios", () => ({
	get: jest.fn(),
	post: jest.fn(),
}));

// Mock MenuItemCard
jest.mock("../components/MenuItemCard", () => (props) => (
	<div data-testid={ `menu-item-${props.item._id}` }>
		<span>{ props.item.name }</span>
		<span>${ props.item.price }</span>
		<button onClick={ props.onAdd }>Add to Cart</button>
		{ props.children }
	</div>
));

// Mock useCart hook
jest.mock("../context/CartContext", () => ({
	useCart: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SmartOrder from "../pages/SmartOrder";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

// Helper to render with providers
const renderWithProviders = (component, { user = null } = {}) => {
	return render(
		<AuthContext.Provider value={ { user, login: jest.fn(), logout: jest.fn() } }>
			<BrowserRouter>
				{ component }
			</BrowserRouter>
		</AuthContext.Provider>
	);
};

describe("🍽️ SmartOrder Page", () => {
	const mockAddToCart = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		useCart.mockReturnValue({
			addToCart: mockAddToCart,
			cart: [],
			fetchCart: jest.fn(),
		});
	});

	// ================== INITIAL RENDER TESTS ==================
	describe("Initial Render (Guest User)", () => {
		test("renders page title for guest users", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText("Smart Suggestions")).toBeInTheDocument();
		});

		test("displays guest user description", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText(/Tell us your constraints/i)).toBeInTheDocument();
		});

		test("shows login prompt for guest users", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText(/Log in for personalized recommendations/i)).toBeInTheDocument();
		});

		test("renders budget slider with default value of $20", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText("$20")).toBeInTheDocument();
		});

		test("renders time slider with default value of 30 min", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText("30 min")).toBeInTheDocument();
		});

		test("renders Find My Meal button", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByRole("button", { name: /Find My Meal/i })).toBeInTheDocument();
		});

		test("does NOT show Refresh Preferences button for guests", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.queryByText(/Refresh Preferences/i)).not.toBeInTheDocument();
		});

		test("shows initial state message before search", () => {
			renderWithProviders(<SmartOrder />);
			expect(screen.getByText(/Adjust the sliders above/i)).toBeInTheDocument();
		});
	});

	// ================== LOGGED-IN USER TESTS ==================
	describe("Initial Render (Logged-in User)", () => {
		const mockUser = { id: "user123", name: "Test User" };

		test("renders personalized title for logged-in users", () => {
			renderWithProviders(<SmartOrder />, { user: mockUser });
			expect(screen.getByText("Personalized For You")).toBeInTheDocument();
		});

		test("displays personalized description", () => {
			renderWithProviders(<SmartOrder />, { user: mockUser });
			expect(screen.getByText(/Our AI analyzes your taste/i)).toBeInTheDocument();
		});

		test("shows Refresh Preferences button for logged-in users", () => {
			renderWithProviders(<SmartOrder />, { user: mockUser });
			expect(screen.getByText(/Refresh Preferences/i)).toBeInTheDocument();
		});

		test("does NOT show login prompt for logged-in users", () => {
			renderWithProviders(<SmartOrder />, { user: mockUser });
			expect(screen.queryByText(/Log in for personalized/i)).not.toBeInTheDocument();
		});
	});

	// ================== SLIDER INTERACTION TESTS ==================
	describe("Slider Interactions", () => {
		test("updates budget when slider is moved", () => {
			renderWithProviders(<SmartOrder />);
			const sliders = screen.getAllByRole("slider");
			const budgetSlider = sliders[0];

			fireEvent.change(budgetSlider, { target: { value: "35" } });
			expect(screen.getByText("$35")).toBeInTheDocument();
		});

		test("updates time when slider is moved", () => {
			renderWithProviders(<SmartOrder />);
			const sliders = screen.getAllByRole("slider");
			const timeSlider = sliders[1];

			fireEvent.change(timeSlider, { target: { value: "45" } });
			expect(screen.getByText("45 min")).toBeInTheDocument();
		});
	});

	// ================== API CALL TESTS (GUEST) ==================
	describe("API Calls (Guest User)", () => {
		test("calls smart-suggestions endpoint for guest users", async () => {
			api.get.mockResolvedValue({ data: { suggestions: [] } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(api.get).toHaveBeenCalledWith("/recommend/smart-suggestions", {
					params: { budget: 20, timeAvailable: 30, limit: 12 }
				});
			});
		});

		test("shows loading state when fetching", async () => {
			api.get.mockImplementation(() => new Promise(() => { }));

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText(/Analyzing/i)).toBeInTheDocument();
			});
		});
	});

	// ================== API CALL TESTS (LOGGED-IN) ==================
	describe("API Calls (Logged-in User)", () => {
		const mockUser = { id: "user123", name: "Test User" };

		test("calls personalized endpoint for logged-in users", async () => {
			api.get.mockResolvedValue({ data: { recommendations: [] } });

			renderWithProviders(<SmartOrder />, { user: mockUser });
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(api.get).toHaveBeenCalledWith("/recommend/personalized", {
					params: { budget: 20, timeAvailable: 30, limit: 12 }
				});
			});
		});

		test("calls update-preferences endpoint when refreshing", async () => {
			api.post.mockResolvedValue({ data: {} });
			api.get.mockResolvedValue({ data: { recommendations: [] } });

			renderWithProviders(<SmartOrder />, { user: mockUser });
			fireEvent.click(screen.getByText(/Refresh Preferences/i));

			await waitFor(() => {
				expect(api.post).toHaveBeenCalledWith("/recommend/update-preferences");
			});
		});
	});

	// ================== RESULTS DISPLAY TESTS ==================
	describe("Results Display", () => {
		const mockSuggestions = [
			{
				_id: "item1",
				name: "Latte",
				price: 4.5,
				prepTime: 5,
				reasons: ["Quick Prep", "Great Value"],
			},
			{
				_id: "item2",
				name: "Burger",
				price: 8.0,
				prepTime: 15,
				reasons: ["Under Budget"],
				score: 0.85,
			},
		];

		test("displays suggestions when API returns results", async () => {
			api.get.mockResolvedValue({ data: { suggestions: mockSuggestions } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Latte")).toBeInTheDocument();
				expect(screen.getByText("Burger")).toBeInTheDocument();
			});
		});

		test("displays Top Recommendations heading", async () => {
			api.get.mockResolvedValue({ data: { suggestions: mockSuggestions } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Top Recommendations")).toBeInTheDocument();
			});
		});

		test("displays item count badge", async () => {
			api.get.mockResolvedValue({ data: { suggestions: mockSuggestions } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("2 items found")).toBeInTheDocument();
			});
		});

		test("displays reason tags for items", async () => {
			api.get.mockResolvedValue({ data: { suggestions: mockSuggestions } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Quick Prep")).toBeInTheDocument();
				expect(screen.getByText("Great Value")).toBeInTheDocument();
			});
		});

		test("displays score badge for personalized items", async () => {
			api.get.mockResolvedValue({ data: { suggestions: mockSuggestions } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("85%")).toBeInTheDocument();
			});
		});
	});

	// ================== EMPTY STATE TESTS ==================
	describe("Empty State", () => {
		test("displays no matches message when results are empty", async () => {
			api.get.mockResolvedValue({ data: { suggestions: [] } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("No matches found")).toBeInTheDocument();
			});
		});

		test("shows reset filters button", async () => {
			api.get.mockResolvedValue({ data: { suggestions: [] } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Reset filters to defaults")).toBeInTheDocument();
			});
		});

		test("reset filters button updates sliders", async () => {
			api.get.mockResolvedValue({ data: { suggestions: [] } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Reset filters to defaults")).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText("Reset filters to defaults"));

			// Should reset to 30 and 45
			expect(screen.getByText("$30")).toBeInTheDocument();
			expect(screen.getByText("45 min")).toBeInTheDocument();
		});
	});

	// ================== ERROR HANDLING TESTS ==================
	describe("Error Handling", () => {
		test("displays error message when API fails", async () => {
			api.get.mockRejectedValue({
				response: { data: { message: "Server error" } }
			});

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Server error")).toBeInTheDocument();
			});
		});

		test("displays fallback error message when no response", async () => {
			api.get.mockRejectedValue(new Error("Network error"));

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Failed to load suggestions")).toBeInTheDocument();
			});
		});
	});

	// ================== CART INTEGRATION TESTS ==================
	describe("Cart Integration", () => {
		test("calls addToCart when Add button is clicked", async () => {
			const mockItem = { _id: "item1", name: "Coffee", price: 3, reasons: [] };
			api.get.mockResolvedValue({ data: { suggestions: [mockItem] } });

			renderWithProviders(<SmartOrder />);
			fireEvent.click(screen.getByRole("button", { name: /Find My Meal/i }));

			await waitFor(() => {
				expect(screen.getByText("Coffee")).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText("Add to Cart"));
			expect(mockAddToCart).toHaveBeenCalledWith(mockItem);
		});
	});
});
