/** @jest-environment jsdom */

// ✅ mock axios to avoid ESM import + interceptor issues
jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return mockAxios;
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import { AuthContext } from "../context/AuthContext";

describe("🛡️ AdminProtectedRoute", () => {
  const renderWithAuth = (authValue, initialPath = "/admin") => {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  test("renders nothing while loading", () => {
    const { container } = renderWithAuth({ user: null, loading: true });
    expect(container).toBeEmptyDOMElement();
  });

  test("redirects to /login when not logged in", () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects to home when user is not admin", () => {
    renderWithAuth({
      user: { name: "Rujuta", role: "staff" },
      loading: false,
    });
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  test("renders outlet when user is admin", () => {
    renderWithAuth({
      user: { name: "Rujuta", role: "admin" },
      loading: false,
    });
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
