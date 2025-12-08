// frontend/src/__tests__/BuildYourOwn.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BuildYourOwn from "../pages/BuildYourOwn";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

// Mocks
jest.mock("../api/axios");
jest.mock("../context/CartContext", () => ({ useCart: () => ({ fetchCart: jest.fn() }) }));
jest.mock("../context/ModalContext", () => ({ useModal: () => ({ showLoginModal: jest.fn() }) }));
jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
}));

const mockUser = { _id: "u1", name: "Test User" };

describe("BuildYourOwn (Meal Builder)", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Setup API mocks
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

	const renderPage = (user = mockUser) => {
		return render(
			<AuthContext.Provider value={ { user } }>
				<BuildYourOwn />
			</AuthContext.Provider>
		);
	};

	it("renders Step 1 (Drink) initially", async () => {
		renderPage();
		await waitFor(() => expect(screen.getByText("☕ Choose Your Drink")).toBeInTheDocument());
		expect(screen.getByText("Green Tea")).toBeInTheDocument();
	});

	it("allows full flow: Select Drink -> Main -> Side -> Review -> Add to Cart", async () => {
		renderPage();

		// Step 1: Drink
		await waitFor(() => expect(screen.getByText("☕ Choose Your Drink")).toBeInTheDocument());
		fireEvent.click(screen.getByText("Green Tea"));

		// Customize Drink (Select Sugar)
		await waitFor(() => expect(screen.getByText("✨ Customize Green Tea")).toBeInTheDocument());
		fireEvent.click(screen.getByText("Sugar"));

		fireEvent.click(screen.getByText("Next →"));

		// Step 2: Main
		await waitFor(() => expect(screen.getByText("🍔 Choose Your Main")).toBeInTheDocument());
		fireEvent.click(screen.getByText("Burger"));
		// Customize Main (Select Cheese)
		await waitFor(() => expect(screen.getByText("✨ Customize Burger")).toBeInTheDocument());
		fireEvent.click(screen.getByText("Cheese"));

		fireEvent.click(screen.getByText("Next →"));

		// Step 3: Side
		await waitFor(() => expect(screen.getByText("🍪 Choose Your Side")).toBeInTheDocument());
		fireEvent.click(screen.getByText("Fries"));

		fireEvent.click(screen.getByText("Next →"));

		// Step 4: Review
		await waitFor(() => expect(screen.getByText("Review Your Meal 🍽️")).toBeInTheDocument());

		// Check content
		expect(screen.getByText("Green Tea")).toBeInTheDocument();
		expect(screen.getByText("Burger")).toBeInTheDocument();
		expect(screen.getByText("Fries")).toBeInTheDocument();

		// Check Total
		// Drink: 3.0 + 0.5 = 3.5
		// Main: 10.0 + 1.0 = 11.0
		// Side: 4.0
		// Total: 18.50
		// Note: Component uses toFixed(2)
		expect(screen.getByText("$18.50")).toBeInTheDocument();

		// Add to Cart
		fireEvent.click(screen.getByText(/Add Meal to Cart/i));

		await waitFor(() => expect(api.post).toHaveBeenCalledWith("/cart", expect.anything()));
	});
});
