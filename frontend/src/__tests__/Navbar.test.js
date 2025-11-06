import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useCart } from "../context/CartContext";
import { MemoryRouter } from "react-router-dom";

// ✅ Mock the hooks and contexts
jest.mock("../context/ModalContext", () => ({
  useModal: jest.fn(),
}));
jest.mock("../context/CartContext", () => ({
  useCart: jest.fn(),
}));
jest.mock("../api/axios", () => ({
  post: jest.fn(() => Promise.resolve({})),
}));

// Wrapper for router + AuthContext
const renderNavbar = (authValues) => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValues}>
        <Navbar />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("🍔 Navbar Component", () => {
  let mockModal, mockCart;

  beforeEach(() => {
    mockModal = {
      showLogin: false,
      showLoginModal: jest.fn(),
      hideLoginModal: jest.fn(),
    };
    mockCart = { cart: [] };
    useModal.mockReturnValue(mockModal);
    useCart.mockReturnValue(mockCart);
  });

  test("renders logo and basic links", () => {
    renderNavbar({ user: null, logout: jest.fn(), login: jest.fn() });
    expect(screen.getByAltText(/WrikiCafe Logo/i)).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  test("shows Login button when no user", () => {
    renderNavbar({ user: null, logout: jest.fn(), login: jest.fn() });
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("shows Logout and welcome message when user logged in", () => {
    const mockLogout = jest.fn();
    renderNavbar({
      user: { name: "Rujuta", role: "customer" },
      logout: mockLogout,
      login: jest.fn(),
    });
    expect(screen.getByText(/Welcome, Rujuta/i)).toBeInTheDocument();
    const logoutBtn = screen.getByText("Logout");
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });

  test("shows Admin link if user.role = admin", () => {
    renderNavbar({
      user: { name: "AdminUser", role: "admin" },
      logout: jest.fn(),
      login: jest.fn(),
    });
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("does NOT show Admin link if not admin", () => {
    renderNavbar({
      user: { name: "StaffUser", role: "staff" },
      logout: jest.fn(),
      login: jest.fn(),
    });
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  test("calls showLoginModal when Login clicked", () => {
    renderNavbar({ user: null, logout: jest.fn(), login: jest.fn() });
    const loginBtn = screen.getByText("Login");
    fireEvent.click(loginBtn);
    expect(mockModal.showLoginModal).toHaveBeenCalled();
  });

  test("renders cart badge when there are items", () => {
    useCart.mockReturnValue({
      cart: [
        { menuItem: { _id: 1 }, quantity: 2 },
        { menuItem: { _id: 2 }, quantity: 1 },
      ],
    });
    renderNavbar({ user: null, logout: jest.fn(), login: jest.fn() });
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
