import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

export default function BuildYourOwn() {
	const navigate = useNavigate();
	const { user } = useContext(AuthContext);
	const { showLoginModal } = useModal();
	const { fetchCart } = useCart();

	const [step, setStep] = useState(1); // 1: Drink, 2: Main, 3: Side, 4: Review
	const [menuItems, setMenuItems] = useState([]);
	const [ingredients, setIngredients] = useState([]);
	const [loading, setLoading] = useState(true);

	// Meal State: { base: menuItemId, ingredients: [ingredientId] }
	const [mealState, setMealState] = useState({
		drink: { base: null, ingredients: [] },
		main: { base: null, ingredients: [] },
		side: { base: null, ingredients: [] },
	});

	// Fetch data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [menuRes, ingredientsRes] = await Promise.all([
					api.get("/menu?all=true"),
					api.get("/ingredients"),
				]);
				setMenuItems(menuRes.data || []);
				setIngredients(ingredientsRes.data.ingredients || []);
			} catch (err) {
				console.error("Failed to load data:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Helper: Get items for current step based on itemGroup
	const getItemsForStep = () => {
		let itemGroup = "";
		if (step === 1) itemGroup = "drink";
		else if (step === 2) itemGroup = "main";
		else if (step === 3) itemGroup = "side";

		return menuItems.filter((item) => item.itemGroup === itemGroup);
	};

	// Helper: Get ingredients for current section
	const getIngredientsForSection = (section) => {
		return ingredients.filter((ing) =>
			ing.applicableFor && ing.applicableFor.includes(section)
		);
	};

	// Helper: Get current section key
	const getCurrentSection = () => {
		if (step === 1) return "drink";
		if (step === 2) return "main";
		if (step === 3) return "side";
		return null;
	};

	// Handlers
	const handleBaseSelect = (itemId) => {
		const section = getCurrentSection();
		setMealState((prev) => ({
			...prev,
			[section]: { ...prev[section], base: itemId, ingredients: [] }, // Reset ingredients on base change
		}));
	};

	const handleIngredientToggle = (ingredientId) => {
		const section = getCurrentSection();
		setMealState((prev) => {
			const currentIngredients = prev[section].ingredients;
			const newIngredients = currentIngredients.includes(ingredientId)
				? currentIngredients.filter((id) => id !== ingredientId)
				: [...currentIngredients, ingredientId];
			return {
				...prev,
				[section]: { ...prev[section], ingredients: newIngredients },
			};
		});
	};

	const handleNext = () => {
		if (step < 4) setStep(step + 1);
	};

	const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};

	const handleSkip = () => {
		// Clear current selection and move next
		const section = getCurrentSection();
		setMealState((prev) => ({
			...prev,
			[section]: { base: null, ingredients: [] },
		}));
		handleNext();
	};

	const calculateTotal = () => {
		let total = 0;
		Object.values(mealState).forEach((part) => {
			if (part.base) {
				const item = menuItems.find((i) => i._id === part.base);
				if (item) total += item.price;
				part.ingredients.forEach((ingId) => {
					const ing = ingredients.find((i) => i._id === ingId);
					if (ing) total += ing.price;
				});
			}
		});
		return total.toFixed(2);
	};

	const handleAddToCart = async () => {
		if (!user) {
			showLoginModal();
			return;
		}

		const mealGroupId = Math.random().toString(36).substr(2, 9);
		const itemsPayload = [];

		Object.entries(mealState).forEach(([, part]) => {
			if (part.base) {
				const customizations = part.ingredients.map((ingId) => {
					const ing = ingredients.find((i) => i._id === ingId);
					return {
						ingredientId: ing._id,
						name: ing.name,
						price: ing.price,
					};
				});

				itemsPayload.push({
					menuItem: part.base,
					quantity: 1,
					customizations,
					mealGroupId,
				});
			}
		});

		if (itemsPayload.length === 0) return;

		try {
			await api.post("/cart", { items: itemsPayload });
			await fetchCart(); // Refresh cart context
			navigate("/cart");
		} catch (err) {
			console.error("Failed to add meal to cart:", err);
			alert("Failed to add to cart. Please try again.");
		}
	};

	if (loading) return (
		<div className="flex items-center justify-center min-h-screen text-xl">
			Loading menu…
		</div>
	);

	// Render Review Step
	if (step === 4) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-6">
					<h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Review Your Meal 🍽️</h1>

					<div className="grid gap-6 md:grid-cols-3 mb-8">
						{ ["drink", "main", "side"].map((key) => {
							const part = mealState[key];
							const baseItem = menuItems.find((i) => i._id === part.base);

							return (
								<div key={ key } className={ `border-2 rounded-2xl p-5 transition-shadow ${baseItem ? 'bg-orange-50 border-orange-200 shadow-md hover:shadow-lg' : 'bg-gray-50 border-gray-300 border-dashed'}` }>
									<h3 className="text-xl font-semibold capitalize mb-2">{ key }</h3>
									{ baseItem ? (
										<>
											<div className="font-medium text-lg">{ baseItem.name }</div>
											<div className="text-gray-600">${ baseItem.price.toFixed(2) }</div>
											{ part.ingredients.length > 0 && (
												<div className="mt-2 text-sm text-gray-500">
													<p className="font-medium">Extras:</p>
													<ul className="list-disc list-inside">
														{ part.ingredients.map(id => {
															const ing = ingredients.find(i => i._id === id);
															return ing ? <li key={ id }>{ ing.name } (+${ ing.price.toFixed(2) })</li> : null;
														}) }
													</ul>
												</div>
											) }
										</>
									) : (
										<p className="text-gray-400 italic">None selected</p>
									) }
									<button
										onClick={ () => setStep(key === 'drink' ? 1 : key === 'main' ? 2 : 3) }
										className="mt-4 text-blue-600 text-sm hover:underline"
									>
										Edit
									</button>
								</div>
							);
						}) }
					</div>

					<div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-600">
						<div className="text-3xl font-bold mb-6 text-center text-gray-900">
							Total: <span className="text-red-600">${ calculateTotal() }</span>
						</div>
						<div className="flex gap-4 justify-center">
							<button
								onClick={ handleBack }
								className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 font-semibold transition"
							>
								Back
							</button>
							<button
								onClick={ handleAddToCart }
								className="px-10 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 shadow-lg transition"
							>
								Add Meal to Cart 🛒
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Render Selection Steps
	const section = getCurrentSection();
	const currentPart = mealState[section];
	const stepItems = getItemsForStep();
	const selectedBaseItem = menuItems.find(i => i._id === currentPart.base);
	const availableIngredients = getIngredientsForSection(section);

	// Sides don't have customizations
	const showCustomizations = section !== "side";

	return (
		<div className="min-h-screen bg-gray-50 pt-24 pb-6">
			<div className="max-w-7xl mx-auto px-4 flex flex-col">
				{/* Progress Bar */ }
				<div className="bg-white rounded-2xl shadow-md p-6 mb-6">
					<div className="flex justify-between items-center relative max-w-2xl mx-auto">
						<div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
						{ [{ num: 1, label: 'Drink' }, { num: 2, label: 'Main' }, { num: 3, label: 'Side' }, { num: 4, label: 'Review' }].map((s) => (
							<button
								key={ s.num }
								onClick={ () => setStep(s.num) }
								className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
							>
								<div
									className={ `w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md ${step >= s.num ? "bg-red-600 text-white scale-110" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
										}` }
								>
									{ s.num }
								</div>
								<span className={ `text-xs mt-2 font-medium ${step >= s.num ? 'text-red-600' : 'text-gray-400'}` }>{ s.label }</span>
							</button>
						)) }
					</div>
				</div>

				<div className="flex-1">
					<h2 className="text-4xl font-bold mb-2 capitalize text-center text-gray-900">
						{ section === 'drink' && '☕ Choose Your Drink' }
						{ section === 'main' && '🍔 Choose Your Main' }
						{ section === 'side' && '🍪 Choose Your Side' }
					</h2>
					<p className="text-center text-gray-600 mb-8 text-lg">
						{ section === 'drink' && "Start with some fuel" }
						{ section === 'main' && "Add something substantial" }
						{ section === 'side' && "Don't forget a treat!" }
					</p>

					<div className="grid md:grid-cols-12 gap-8">
						{/* Left: Menu Items */ }
						<div className={ showCustomizations ? "md:col-span-7 lg:col-span-8" : "md:col-span-12" }>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{ stepItems.map((item) => (
									<div
										key={ item._id }
										onClick={ () => handleBaseSelect(item._id) }
										className={ `cursor-pointer rounded-2xl p-4 transition-all ${currentPart.base === item._id
											? "bg-red-100 border-4 border-red-600 shadow-lg scale-105"
											: "bg-orange-50 border-2 border-orange-200 hover:shadow-lg hover:scale-102"
											}` }
									>
										{ item.image && (
											<img
												src={ item.image }
												alt={ item.name }
												className="w-full h-40 object-cover rounded-xl mb-3"
											/>
										) }
										<h4 className="text-lg font-semibold text-red-900">{ item.name }</h4>
										<p className="text-gray-600 text-sm line-clamp-2">{ item.description }</p>
										<p className="text-gray-800 font-bold mt-2 text-lg">${ item.price.toFixed(2) }</p>
									</div>
								)) }
							</div>
						</div>

						{/* Right: Customization Panel (only for drinks and mains) */ }
						{ showCustomizations && (
							<div className="md:col-span-5 lg:col-span-4">
								<div className="sticky top-4 bg-white border-2 border-orange-200 rounded-2xl shadow-xl p-6">
									<h3 className="text-2xl font-bold mb-4 border-b-2 border-red-600 pb-3 text-gray-900">
										✨ Customize { selectedBaseItem?.name || "Your Selection" }
									</h3>

									{ selectedBaseItem ? (
										<div className="space-y-6">
											<div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
												{/* Group ingredients by category */ }
												{ ["dairy", "flavoring", "topping", "bread", "protein", "vegetable", "other"].map(cat => {
													const catIngredients = availableIngredients.filter(i => i.category === cat);
													if (catIngredients.length === 0) return null;

													return (
														<div key={ cat }>
															<h4 className="font-semibold capitalize text-gray-700 mb-2">{ cat }</h4>
															<div className="space-y-2">
																{ catIngredients.map(ing => (
																	<label key={ ing._id } className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
																		<div className="flex items-center">
																			<input
																				type="checkbox"
																				checked={ currentPart.ingredients.includes(ing._id) }
																				onChange={ () => handleIngredientToggle(ing._id) }
																				className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
																			/>
																			<span className="ml-2 text-sm">{ ing.name }</span>
																		</div>
																		<span className="text-xs text-gray-500">+${ ing.price.toFixed(2) }</span>
																	</label>
																)) }
															</div>
														</div>
													);
												}) }
											</div>

											<div className="pt-4 border-t mt-4">
												<div className="flex justify-between font-bold text-lg mb-4">
													<span>Subtotal:</span>
													<span>
														$
														{ (
															selectedBaseItem.price +
															currentPart.ingredients.reduce((sum, id) => {
																const ing = ingredients.find((i) => i._id === id);
																return sum + (ing ? ing.price : 0);
															}, 0)
														).toFixed(2) }
													</span>
												</div>
											</div>
										</div>
									) : (
										<div className="text-center py-16 text-gray-400">
											<div className="text-6xl mb-4">👈</div>
											<p className="text-lg">Select an item to customize it</p>
										</div>
									) }

									{/* Navigation Buttons */ }
									<div className="flex gap-2 mt-6">
										{ step > 1 && (
											<button
												onClick={ handleBack }
												className="flex-1 py-2.5 border-2 border-gray-300 rounded-full hover:bg-gray-50 font-medium transition"
											>
												Back
											</button>
										) }
										<button
											onClick={ handleSkip }
											className="flex-1 py-2.5 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full font-medium transition"
										>
											Skip ⏭️
										</button>
										<button
											onClick={ handleNext }
											disabled={ !currentPart.base }
											className={ `flex-1 py-2.5 rounded-full font-semibold text-white transition-all ${currentPart.base
												? "bg-red-600 hover:bg-red-700 shadow-md"
												: "bg-gray-300 cursor-not-allowed"
												}` }
										>
											Next →
										</button>
									</div>
								</div>
							</div>
						) }
					</div>

					{/* For sides (no customization panel), show nav buttons at bottom */ }
					{ !showCustomizations && (
						<div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
							<div className="flex gap-4 justify-center">
								{ step > 1 && (
									<button
										onClick={ handleBack }
										className="px-8 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 font-semibold transition"
									>
										Back
									</button>
								) }
								<button
									onClick={ handleSkip }
									className="px-8 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full font-semibold transition"
								>
									Skip ⏭️
								</button>
								<button
									onClick={ handleNext }
									disabled={ !currentPart.base }
									className={ `px-10 py-3 rounded-full font-semibold text-white transition-all shadow-md ${currentPart.base
										? "bg-red-600 hover:bg-red-700"
										: "bg-gray-300 cursor-not-allowed"
										}` }
								>
									Next →
								</button>
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
}
