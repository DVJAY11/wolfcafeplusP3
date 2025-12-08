import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "../pages/admin/AdminDashboard";
import api from "../api/axios";

// Mock axios
jest.mock("../api/axios", () => ({
	get: jest.fn(),
}));

describe("📊 AdminDashboard", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders loading state initially", () => {
		api.get.mockReturnValue(new Promise(() => { })); // Never resolves
		render(<AdminDashboard />);
		expect(screen.getByText(/Loading metrics/i)).toBeInTheDocument();
	});

	test("renders dashboard with stats after loading", async () => {
		api.get.mockResolvedValueOnce({
			data: {
				totalUsers: 50,
				totalMenuItems: 25,
				totalOrders: 100,
				totalRevenue: 1500.0,
			},
		});

		render(<AdminDashboard />);

		await waitFor(() => {
			expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
		});

		// Check stat cards are rendered
		expect(screen.getByText("Users")).toBeInTheDocument();
		expect(screen.getByText("Menu Items")).toBeInTheDocument();
		expect(screen.getByText("Orders")).toBeInTheDocument();
		expect(screen.getByText("Revenue")).toBeInTheDocument();

		// Check values
		expect(screen.getByText("50")).toBeInTheDocument();
		expect(screen.getByText("25")).toBeInTheDocument();
		expect(screen.getByText("100")).toBeInTheDocument();
	});

	test("calls API to fetch stats on mount", async () => {
		api.get.mockResolvedValueOnce({
			data: {
				totalUsers: 10,
				totalMenuItems: 5,
				totalOrders: 20,
				totalRevenue: 500.0,
			},
		});

		render(<AdminDashboard />);

		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith("/admin/stats");
		});
	});

	test("handles API error gracefully", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
		api.get.mockRejectedValueOnce(new Error("Network error"));

		render(<AdminDashboard />);

		await waitFor(() => {
			expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
		});

		// Console error should have been called
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
