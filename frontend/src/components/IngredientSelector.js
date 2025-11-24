import React from "react";

export default function IngredientSelector({
	ingredient,
	isSelected,
	onToggle,
	disabled = false,
}) {
	const handleClick = () => {
		if (!disabled) {
			onToggle(ingredient._id);
		}
	};

	return (
		<div
			onClick={ handleClick }
			className={ `relative rounded-xl p-3 cursor-pointer transition border-2 ${disabled
					? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
					: isSelected
						? "bg-red-50 border-red-600"
						: "bg-white border-gray-200 hover:border-red-400"
				}` }
		>
			{/* Checkbox indicator */ }
			<div className="absolute top-2 right-2">
				<div
					className={ `w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
							? "bg-red-600 border-red-600"
							: "bg-white border-gray-300"
						}` }
				>
					{ isSelected && (
						<svg
							className="w-3 h-3 text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					) }
				</div>
			</div>

			{/* Ingredient image */ }
			{ ingredient.image && (
				<img
					src={ ingredient.image }
					alt={ ingredient.name }
					className="w-full h-24 object-cover rounded-lg mb-2"
				/>
			) }

			{/* Ingredient name */ }
			<h4 className="font-semibold text-gray-800 text-sm mb-1">
				{ ingredient.name }
			</h4>

			{/* Price */ }
			<p className="text-red-700 font-medium text-sm mb-2">
				+${ ingredient.price.toFixed(2) }
			</p>

			{/* Dietary tags */ }
			{ ingredient.dietaryTags && ingredient.dietaryTags.length > 0 && (
				<div className="flex flex-wrap gap-1 mb-1">
					{ ingredient.dietaryTags.map((tag) => (
						<span
							key={ tag }
							className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
						>
							{ tag }
						</span>
					)) }
				</div>
			) }

			{/* Allergen warnings */ }
			{ ingredient.allergens && ingredient.allergens.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{ ingredient.allergens.map((allergen) => (
						<span
							key={ allergen }
							className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
						>
							⚠️ { allergen }
						</span>
					)) }
				</div>
			) }

			{ disabled && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 rounded-xl">
					<span className="text-white font-semibold text-xs bg-gray-800 px-3 py-1 rounded-full">
						Conflicts with dietary filters
					</span>
				</div>
			) }
		</div>
	);
}
