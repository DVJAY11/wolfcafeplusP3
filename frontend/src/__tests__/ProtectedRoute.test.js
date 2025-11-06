/** @jest-environment jsdom */

// ✅ mock axios so Jest doesn’t parse ESM and has interceptors defined
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
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";

describe("🛡️ ProtectedRoute", () => {
  // helper to render component with context and router
  const renderWithAuth = (authValue, initialPath = "/protected") => {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  test("renders nothing when loading", () => {
    const { container } = renderWithAuth({ user: null, loading: true });
    expect(container).toBeEmptyDOMElement();
  });

  test("renders child route when user exists", () => {
    renderWithAuth({ user: { name: "Rujuta" }, loading: false });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to /login when no user", () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
