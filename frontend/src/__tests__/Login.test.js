// 🚨 Must come BEFORE any imports that depend on axios
jest.mock("../api/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import { AuthContext } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

// 🧩 Mock useNavigate (React Router)
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("🔐 Login Component", () => {
  const mockLogin = jest.fn();

  const renderLogin = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });
test("renders login form with inputs and button", () => {
  renderLogin();
  // check the header (role=heading avoids duplicate match)
  expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();

  // check the inputs and button
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
});

  test("updates email and password fields", () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("secret");
  });

  test("calls login and navigates on successful login", async () => {
    mockLogin.mockResolvedValueOnce();
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "123456");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() =>
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    );
  });
});
