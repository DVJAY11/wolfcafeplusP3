import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import api from "../api/axios";
import { MemoryRouter } from "react-router-dom";

jest.mock("../api/axios", () => ({
  get: jest.fn(),
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe("🏠 Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders hero section with heading and ORDER NOW button", () => {
    api.get.mockResolvedValueOnce({ data: { message: "Backend OK" } });
    renderHome();

    expect(
      screen.getByText(/Smarter and Social AI-Powered Campus Ordering/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Revolutionizing campus dining/i)).toBeInTheDocument();

    const button = screen.getByRole("link", { name: /ORDER NOW/i });
    expect(button).toHaveAttribute("href", "/menu");
  });

  test("renders gallery images and opens/closes lightbox", async () => {
    api.get.mockResolvedValueOnce({ data: { message: "Backend OK" } });
    renderHome();

    const images = await screen.findAllByRole("img", { name: /gallery/i });
    expect(images.length).toBeGreaterThan(5);

    fireEvent.click(images[0]);
    expect(screen.getByAltText(/preview/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("×"));
    await waitFor(() =>
      expect(screen.queryByAltText(/preview/i)).not.toBeInTheDocument()
    );
  });

  test("displays API message on successful fetch", async () => {
    api.get.mockResolvedValueOnce({ data: { message: "Backend alive!" } });
    renderHome();

    await waitFor(() =>
      expect(screen.getByText(/Backend alive!/i)).toBeInTheDocument()
    );
  });

  test("displays fallback message if backend not reachable", async () => {
    api.get.mockRejectedValueOnce(new Error("Network down"));
    renderHome();

    await waitFor(() =>
      expect(screen.getByText(/Backend not reachable/i)).toBeInTheDocument()
    );
  });

  test("renders info and footer sections with contact details", () => {
    api.get.mockResolvedValueOnce({ data: { message: "Ping" } });
    renderHome();

    // Info Section
    expect(screen.getByText(/Order with Convenience/i)).toBeInTheDocument();
    expect(screen.getByText(/Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Operating Hours/i)).toBeInTheDocument();

    // Footer - allow multiple WrikiCafe occurrences
    const cafeTexts = screen.getAllByText(/WrikiCafe/i);
    expect(cafeTexts.length).toBeGreaterThan(0);

    // Contact info (loose match to ignore emoji or spacing)
    const footerText = document.body.textContent;
    expect(footerText).toMatch(/wrikicafe@gmail\.com/i);
    expect(footerText).toMatch(/919/i);

    // Social icons via href substring match
    const links = screen.getAllByRole("link");
    const socials = ["instagram", "facebook", "twitter", "linkedin"];
    socials.forEach((platform) => {
      const found = links.find((l) => l.href.includes(platform));
      expect(found).toBeTruthy();
    });
  });
});
