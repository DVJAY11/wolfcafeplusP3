import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SmartOrder from "../pages/SmartOrder";
import { CartProvider } from "../context/CartContext";
import AuthProvider from "../context/AuthContext";
import api from "../api/axios";

// Mock the api module
jest.mock("../api/axios");

const renderWithProviders = (component) => {
	return render(
		<AuthProvider>
			<CartProvider>
				<BrowserRouter>
					{ component }
				</BrowserRouter>
			</CartProvider>
		</AuthProvider>
	);
};

describe("SmartOrder Page", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the Smart Order page with title", () => {
		renderWithProviders(<SmartOrder />);
		expect(screen.getByText(/Smart Order/i)).toBeInTheDocument();
		expect(screen.getByText(/Find the perfect meal/i)).toBeInTheDocument();
	});

	it("displays budget slider with default value", () => {
		renderWithProviders(<SmartOrder />);
		expect(screen.getByText(/Budget: \$50/i)).toBeInTheDocument();
	});

	it("displays time selector with default value", () => {
		renderWithProviders(<SmartOrder />);
		expect(screen.getByText(/Time Available: 15 mins/i)).toBeInTheDocument();
	});

	it("updates budget when slider is moved", () => {
		renderWithProviders(<SmartOrder />);
		const budgetSlider = screen.getAllByRole("slider")[0];

		fireEvent.change(budgetSlider, { target: { value: "100" } });
		expect(screen.getByText(/Budget: \$100/i)).toBeInTheDocument();
	});

	it("updates time when slider is moved", () => {
		renderWithProviders(<SmartOrder />);
		const timeSlider = screen.getAllByRole("slider")[1];

		fireEvent.change(timeSlider, { target: { value: "30" } });
		expect(screen.getByText(/Time Available: 30 mins/i)).toBeInTheDocument();
	});

	it("displays Find Suggestions button", () => {
		renderWithProviders(<SmartOrder />);
		expect(screen.getByRole("button", { name: /Find Suggestions/i })).toBeInTheDocument();
	});

	it("shows loading state when fetching suggestions", async () => {
		api.get.mockImplementation(() => new Promise(() => { })); // Never resolves

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(/Finding.../i)).toBeInTheDocument();
		});
	});

	it("displays suggestions when API call succeeds", async () => {
		const mockSuggestions = [
			{
				_id: "1",
				name: "Latte",
				price: 4.5,
				category: "Coffee",
				prepTime: 5,
				reasons: ["Quick Prep", "Great Value"],
				image: "/latte.jpg"
			},
			{
				_id: "2",
				name: "Burger",
				price: 8.0,
				category: "Food",
				prepTime: 15,
				reasons: ["Under Budget"],
				image: "/burger.jpg"
			}
		];

		api.get.mockResolvedValue({
			data: {
				suggestions: mockSuggestions,
				count: 2,
				budget: 50,
				timeAvailable: 15
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText("Latte")).toBeInTheDocument();
			expect(screen.getByText("Burger")).toBeInTheDocument();
		});
	});

	it("displays reason tags for suggestions", async () => {
		const mockSuggestions = [
			{
				_id: "1",
				name: "Quick Snack",
				price: 3.0,
				category: "Snacks",
				prepTime: 5,
				reasons: ["Quick Prep", "Great Value"],
				image: "/snack.jpg"
			}
		];

		api.get.mockResolvedValue({
			data: {
				suggestions: mockSuggestions,
				count: 1,
				budget: 50,
				timeAvailable: 15
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(/✓ Quick Prep/i)).toBeInTheDocument();
			expect(screen.getByText(/✓ Great Value/i)).toBeInTheDocument();
		});
	});

	it("displays prep time badge", async () => {
		const mockSuggestions = [
			{
				_id: "1",
				name: "Coffee",
				price: 3.0,
				category: "Drinks",
				prepTime: 10,
				reasons: ["Quick Prep"],
				image: "/coffee.jpg"
			}
		];

		api.get.mockResolvedValue({
			data: {
				suggestions: mockSuggestions,
				count: 1,
				budget: 50,
				timeAvailable: 15
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(/⏱️ 10 min prep/i)).toBeInTheDocument();
		});
	});

	it("displays no suggestions message when results are empty", async () => {
		api.get.mockResolvedValue({
			data: {
				suggestions: [],
				count: 0,
				budget: 50,
				timeAvailable: 15
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(/No Suggestions Found/i)).toBeInTheDocument();
			expect(screen.getByText(/Try adjusting your budget/i)).toBeInTheDocument();
		});
	});

	it("displays error message when API call fails", async () => {
		const errorMessage = "Failed to load suggestions";
		api.get.mockRejectedValue({
			response: {
				data: {
					message: errorMessage
				}
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	it("calls API with correct parameters", async () => {
		api.get.mockResolvedValue({
			data: {
				suggestions: [],
				count: 0,
				budget: 75,
				timeAvailable: 25
			}
		});

		renderWithProviders(<SmartOrder />);

		// Change budget and time
		const budgetSlider = screen.getAllByRole("slider")[0];
		const timeSlider = screen.getAllByRole("slider")[1];

		fireEvent.change(budgetSlider, { target: { value: "75" } });
		fireEvent.change(timeSlider, { target: { value: "25" } });

		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });
		fireEvent.click(findButton);

		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/recommend/smart-suggestions", {
				params: { budget: 75, timeAvailable: 25 }
			});
		});
	});

	it("disables button while loading", async () => {
		api.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		expect(findButton).toBeDisabled();
	});

	it("shows initial state message before first search", () => {
		renderWithProviders(<SmartOrder />);
		expect(screen.getByText(/Ready to Find Your Perfect Meal/i)).toBeInTheDocument();
	});

	it("displays suggestion count", async () => {
		const mockSuggestions = [
			{ _id: "1", name: "Item 1", price: 5, prepTime: 10, reasons: [], image: "/1.jpg" },
			{ _id: "2", name: "Item 2", price: 6, prepTime: 12, reasons: [], image: "/2.jpg" },
			{ _id: "3", name: "Item 3", price: 7, prepTime: 15, reasons: [], image: "/3.jpg" }
		];

		api.get.mockResolvedValue({
			data: {
				suggestions: mockSuggestions,
				count: 3,
				budget: 50,
				timeAvailable: 15
			}
		});

		renderWithProviders(<SmartOrder />);
		const findButton = screen.getByRole("button", { name: /Find Suggestions/i });

		fireEvent.click(findButton);

		await waitFor(() => {
			expect(screen.getByText(/3 Suggestions Found/i)).toBeInTheDocument();
		});
	});
});
