import React from "react";
import { render, screen } from "@testing-library/react";
import About from "../pages/AboutUs"; // adjust if needed

describe("🦊 About Page", () => {
  beforeEach(() => {
    render(<About />);
  });

  test("renders hero section with title and subtitle", () => {
    expect(
      screen.getByText(/WrikiCafe\+ — A Smarter, More Social Campus Café Experience/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Born at North Carolina State University/i)).toBeInTheDocument();
  });

  test("shows Sanskrit origin explanation", () => {
    expect(screen.getByText(/Sanskrit for/i)).toBeInTheDocument();
  });

  test("renders The Story section correctly", () => {
    expect(screen.getByText(/The Story Behind WrikiCafe\+/i)).toBeInTheDocument();
    expect(screen.getByText(/hundreds of students wait in line/i)).toBeInTheDocument();
    const img = screen.getByAltText(/Students in a cafe/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src");
  });


  test("renders Vision section", () => {
    expect(screen.getByText(/Our Vision for the Future/i)).toBeInTheDocument();
    expect(screen.getByText(/AI to anticipate student needs/i)).toBeInTheDocument();
  });

  test("renders Tech Stack section with all technologies", () => {
    expect(screen.getByText(/Powered By/i)).toBeInTheDocument();
    [
      "React + Vite",
      "Node · Express",
      "MongoDB Atlas",
      "Tailwind CSS",
      "Cloudinary Storage",
      "GitHub Actions CI",
    ].forEach((tech) => expect(screen.getByText(tech)).toBeInTheDocument());
  });

  test("renders Meet the Team section", () => {
    expect(screen.getByText(/Meet the Team/i)).toBeInTheDocument();
    ["Dhruva Kamble", "Rishitha Ramesh", "Rujuta Budke"].forEach((name) =>
      expect(screen.getByText(name)).toBeInTheDocument()
    );
    const githubLinks = screen.getAllByRole("link");
    expect(githubLinks.length).toBeGreaterThanOrEqual(3);
    githubLinks.forEach((link) => {
      expect(link.href).toMatch(/github\.com/i);
    });
  });

  test("renders footer text", () => {
    expect(screen.getByText(/© 2025 WrikiCafe\+ Team 16/i)).toBeInTheDocument();
  });

  test("has multiple sections rendered correctly", () => {
    // Instead of getAllByRole (which might miss sections),
    // use querySelectorAll via container
    const container = document.body;
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(5);
  });

  test("renders descriptive paragraphs", () => {
    const paragraphs = screen.getAllByText(/WrikiCafe/i, { exact: false });
    expect(paragraphs.length).toBeGreaterThan(3);
  });

  test("renders icon labels", () => {
    [
      "React + Vite",
      "Node · Express",
      "MongoDB Atlas",
      "Tailwind CSS",
      "Cloudinary Storage",
      "GitHub Actions CI",
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });
});
