import React, { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
	const { incrementItem, decrementItem, removeFromCart } = useCart();
	const [showCustomizations, setShowCustomizations] = useState(false);

	const menuItem = item.menuItem;
	const quantity = item.quantity || 1;
	const customizations = item.customizations || [];

	// Calculate item total (base price + customizations)
	const basePrice = menuItem?.price || 0;
	const customizationsTotal = customizations.reduce(
		(sum, custom) => sum + (custom.price || 0),
		0
	);
	const itemTotal = basePrice + customizationsTotal;
	const lineTotal = itemTotal * quantity;

	const hasCustomizations = customizations.length > 0;

	return (
		<div className="bg-white rounded-xl shadow-md p-4 mb-4">
			<div className="flex items-start gap-4">
				{/* Image */ }
				<img
					src={ menuItem?.image || "/placeholder.jpg" }
					alt={ menuItem?.name || "Item" }
					className="w-20 h-20 object-cover rounded-lg"
				/>

				{/* Item Details */ }
				<div className="flex-1">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-semibold text-gray-800 text-lg">
								{ menuItem?.name || "Unknown Item" }
							</h3>

							{/* Customized Badge */ }
							{ hasCustomizations && (
								<button
									onClick={ () => setShowCustomizations(!showCustomizations) }
									className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1 hover:bg-red-200 transition"
								>
									🛠️ Customized
									<span className="text-xs">
										{ showCustomizations ? "▼" : "▶" }
									</span>
								</button>
							) }

							{/* Show Customizations */ }
							{ showCustomizations && hasCustomizations && (
								<div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm">
									<p className="font-semibold text-gray-700 mb-1">
										Added Ingredients:
									</p>
									<ul className="list-disc list-inside text-gray-600">
										{ customizations.map((custom, idx) => (
											<li key={ idx }>
												{ custom.name } - ${ custom.price.toFixed(2) }
											</li>
										)) }
									</ul>
								</div>
							) }
						</div>

						{/* Remove Button */ }
						<button
							onClick={ () => removeFromCart(menuItem._id) }
							className="text-red-600 hover:text-red-800 font-semibold text-sm"
						>
							✕ Remove
						</button>
					</div>

					{/* Price breakdown */ }
					<div className="mt-2 text-sm text-gray-600">
						<p>Base: ${ basePrice.toFixed(2) }</p>
						{ hasCustomizations && (
							<p>Customizations: +${ customizationsTotal.toFixed(2) }</p>
						) }
						<p className="font-semibold text-gray-800">
							Item Total: ${ itemTotal.toFixed(2) }
						</p>
					</div>

					{/* Quantity Controls */ }
					<div className="flex items-center gap-3 mt-3">
						<button
							onClick={ () => decrementItem(menuItem) }
							disabled={ quantity <= 1 }
							className={ `px-3 py-1 rounded-full font-bold text-lg transition ${quantity <= 1
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}` }
						>
							−
						</button>

						<span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">
							{ quantity }
						</span>

						<button
							onClick={ () => incrementItem(menuItem) }
							className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold text-lg hover:bg-gray-300 transition"
						>
							+
						</button>

						<span className="ml-auto text-lg font-bold text-red-900">
							${ lineTotal.toFixed(2) }
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
