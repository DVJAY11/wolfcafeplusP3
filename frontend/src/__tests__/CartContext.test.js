import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { CartProvider, useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { ModalProvider } from "../context/ModalContext";
import api from "../api/axios";

// Mock axios
jest.mock("../api/axios", () => ({
	get: jest.fn(),
	post: jest.fn(),
	delete: jest.fn(),
}));

// Test component that uses the cart context
const TestComponent = () => {
	const { cart, addToCart, incrementItem, decrementItem, removeFromCart, clearCart } = useCart();

	return (
		<div>
			<span data-testid="cart-count">{ cart.length }</span>
			<button data-testid="add-btn" onClick={ () => addToCart({ _id: "item1" }) }>Add</button>
			<button data-testid="inc-btn" onClick={ () => incrementItem({ _id: "item1" }) }>Increment</button>
			<button data-testid="dec-btn" onClick={ () => decrementItem({ _id: "item1" }) }>Decrement</button>
			<button data-testid="remove-btn" onClick={ () => removeFromCart("item1") }>Remove</button>
			<button data-testid="clear-btn" onClick={ () => clearCart() }>Clear</button>
		</div>
	);
};

// Helper to render with all required providers
const renderWithProviders = (user = { _id: "user1" }) => {
	return render(
		<AuthContext.Provider value={ { user } }>
			<ModalProvider>
				<CartProvider>
					<TestComponent />
				</CartProvider>
			</ModalProvider>
		</AuthContext.Provider>
	);
};

describe("🛒 CartContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		api.get.mockResolvedValue({ data: { cart: { items: [] } } });
		api.post.mockResolvedValue({ data: { cart: { items: [] } } });
		api.delete.mockResolvedValue({ data: { cart: { items: [] } } });
	});

	test("initializes with empty cart", async () => {
		renderWithProviders();

		await waitFor(() => {
			expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
		});
	});

	test("fetchCart calls API when user is logged in", async () => {
		api.get.mockResolvedValueOnce({
			data: { cart: { items: [{ _id: "1", quantity: 1 }] } },
		});

		renderWithProviders({ _id: "user1" });

		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/cart");
		});
	});

	test("cart is empty when no user", async () => {
		renderWithProviders(null);

		await waitFor(() => {
			expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
		});
	});

	test("clearCart empties the cart", async () => {
		api.get.mockResolvedValueOnce({
			data: { cart: { items: [{ _id: "1", quantity: 1 }] } },
		});

		renderWithProviders();

		await waitFor(() => {
			expect(api.get).toHaveBeenCalled();
		});

		// Click clear
		await act(async () => {
			screen.getByTestId("clear-btn").click();
		});

		expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
	});

	test("incrementItem calls API with positive quantity", async () => {
		api.post.mockResolvedValueOnce({
			data: { cart: { items: [{ _id: "item1", quantity: 2 }] } },
		});

		renderWithProviders();

		await waitFor(() => {
			expect(api.get).toHaveBeenCalled();
		});

		await act(async () => {
			screen.getByTestId("inc-btn").click();
		});

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith("/cart", {
				menuItem: "item1",
				quantity: 1,
			});
		});
	});

	test("decrementItem calls API with negative quantity", async () => {
		api.post.mockResolvedValueOnce({
			data: { cart: { items: [] } },
		});

		renderWithProviders();

		await waitFor(() => {
			expect(api.get).toHaveBeenCalled();
		});

		await act(async () => {
			screen.getByTestId("dec-btn").click();
		});

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith("/cart", {
				menuItem: "item1",
				quantity: -1,
			});
		});
	});

	test("removeFromCart calls API delete", async () => {
		api.delete.mockResolvedValueOnce({
			data: { cart: { items: [] } },
		});

		renderWithProviders();

		await waitFor(() => {
			expect(api.get).toHaveBeenCalled();
		});

		await act(async () => {
			screen.getByTestId("remove-btn").click();
		});

		await waitFor(() => {
			expect(api.delete).toHaveBeenCalledWith("/cart/item1");
		});
	});
});
