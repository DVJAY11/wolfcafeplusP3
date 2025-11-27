import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import IngredientSelector from "../components/IngredientSelector";

describe("🧪 IngredientSelector Component", () => {
	const mockOnToggle = jest.fn();

	const sampleIngredient = {
		_id: "ing1",
		name: "Vanilla Syrup",
		price: 0.5,
		category: "flavoring",
		allergens: [],
		dietaryTags: ["vegan", "gluten-free"],
		image: "https://example.com/vanilla.jpg",
	};

	const ingredientWithAllergens = {
		_id: "ing2",
		name: "Whole Milk",
		price: 0.5,
		category: "dairy",
		allergens: ["dairy"],
		dietaryTags: [],
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders ingredient name and price", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		expect(screen.getByText("Vanilla Syrup")).toBeInTheDocument();
		expect(screen.getByText("+$0.50")).toBeInTheDocument();
	});

	test("renders ingredient image when provided", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		const image = screen.getByAltText("Vanilla Syrup");
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute("src", "https://example.com/vanilla.jpg");
	});

	test("renders dietary tags", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		expect(screen.getByText("vegan")).toBeInTheDocument();
		expect(screen.getByText("gluten-free")).toBeInTheDocument();
	});

	test("renders allergen warnings", () => {
		render(
			<IngredientSelector
				ingredient={ ingredientWithAllergens }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		expect(screen.getByText(/⚠️ dairy/i)).toBeInTheDocument();
	});

	test("calls onToggle when clicked", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		const container = screen.getByText("Vanilla Syrup").closest("div");
		fireEvent.click(container);

		expect(mockOnToggle).toHaveBeenCalledWith("ing1");
	});

	test("shows selected state with checkmark", () => {
		const { container } = render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ true }
				onToggle={ mockOnToggle }
			/>
		);

		// Check for red border (selected state)
		const mainDiv = container.firstChild;
		expect(mainDiv).toHaveClass("border-red-600");

		// Check for checkmark SVG
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	test("shows unselected state without checkmark", () => {
		const { container } = render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		// Check for gray border (unselected state)
		const mainDiv = container.firstChild;
		expect(mainDiv).toHaveClass("border-gray-200");

		// No checkmark SVG
		const svg = container.querySelector("svg");
		expect(svg).not.toBeInTheDocument();
	});

	test("shows disabled state and does not call onToggle when disabled", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
				disabled={ true }
			/>
		);

		const container = screen.getByText("Vanilla Syrup").closest("div");

		// Should have disabled styling
		expect(container).toHaveClass("opacity-50");
		expect(container).toHaveClass("cursor-not-allowed");

		// Should show conflict message
		expect(screen.getByText(/Conflicts with dietary filters/i)).toBeInTheDocument();

		// Should not call onToggle when clicked
		fireEvent.click(container);
		expect(mockOnToggle).not.toHaveBeenCalled();
	});

	test("applies hover effect when not disabled", () => {
		const { container } = render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
				disabled={ false }
			/>
		);

		const mainDiv = container.firstChild;
		expect(mainDiv).toHaveClass("hover:border-red-400");
	});

	test("does not apply hover effect when disabled", () => {
		const { container } = render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
				disabled={ true }
			/>
		);

		const mainDiv = container.firstChild;
		expect(mainDiv).not.toHaveClass("hover:border-red-400");
	});

	test("handles ingredient without image gracefully", () => {
		const ingredientNoImage = { ...sampleIngredient, image: null };
		render(
			<IngredientSelector
				ingredient={ ingredientNoImage }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		// Should not render image
		const image = screen.queryByAltText("Vanilla Syrup");
		expect(image).not.toBeInTheDocument();
	});

	test("handles ingredient without dietary tags", () => {
		const ingredientNoTags = { ...sampleIngredient, dietaryTags: [] };
		render(
			<IngredientSelector
				ingredient={ ingredientNoTags }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		// Should not show dietary tag section
		expect(screen.queryByText("vegan")).not.toBeInTheDocument();
		expect(screen.queryByText("gluten-free")).not.toBeInTheDocument();
	});

	test("handles ingredient without allergens", () => {
		render(
			<IngredientSelector
				ingredient={ sampleIngredient }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		// Should not show allergen warnings
		expect(screen.queryByText(/⚠️/i)).not.toBeInTheDocument();
	});

	test("formats price with two decimal places", () => {
		const ingredientWeirdPrice = { ...sampleIngredient, price: 1.5 };
		render(
			<IngredientSelector
				ingredient={ ingredientWeirdPrice }
				isSelected={ false }
				onToggle={ mockOnToggle }
			/>
		);

		expect(screen.getByText("+$1.50")).toBeInTheDocument();
	});
});
