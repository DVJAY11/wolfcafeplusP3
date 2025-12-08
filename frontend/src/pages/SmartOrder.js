import React, { useState, useContext } from "react";
import api from "../api/axios";
import MenuItemCard from "../components/MenuItemCard";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function SmartOrder() {
	const { user } = useContext(AuthContext);
	const { addToCart } = useCart();

	const [budget, setBudget] = useState(20);
	const [timeAvailable, setTimeAvailable] = useState(30);
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Auto-search on mount if user is logged in (optional, or just wait for user action)
	// For now, let's wait for user action to give them control

	const handleFindSuggestions = async () => {
		setLoading(true);
		setError("");
		setHasSearched(true);

		try {
			const endpoint = user
				? "/recommend/personalized"
				: "/recommend/smart-suggestions";

			const res = await api.get(endpoint, {
				params: {
					budget,
					timeAvailable,
					limit: 12
				}
			});

			// Handle different response structures
			// Personalized returns { recommendations: [...] }
			// Smart suggestions returns { suggestions: [...] }
			const items = res.data.recommendations || res.data.suggestions || [];
			setSuggestions(items);

		} catch (err) {
			console.error("❌ Failed to fetch suggestions:", err);
			setError(err.response?.data?.message || "Failed to load suggestions");
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePreferences = async () => {
		if (!user) return;

		setRefreshing(true);
		try {
			await api.post("/recommend/update-preferences");
			// Re-fetch suggestions after update
			await handleFindSuggestions();
		} catch (err) {
			console.error("Failed to update preferences:", err);
		} finally {
			setRefreshing(false);
		}
	};

	// Helper to get score color
	const getScoreColor = (score) => {
		if (score >= 0.8) return "bg-green-100 text-green-800 border-green-200";
		if (score >= 0.6) return "bg-blue-100 text-blue-800 border-blue-200";
		return "bg-gray-100 text-gray-800 border-gray-200";
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-12">
			{/* Hero Section */ }
			<div className="bg-white shadow-sm border-b border-gray-200 mb-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
					<h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
						{ user ? "Personalized For You" : "Smart Suggestions" }
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						{ user
							? "Our AI analyzes your taste to find meals you'll love, fitting your budget and schedule."
							: "Tell us your constraints and we'll find the best popular options for you." }
					</p>

					{ !user && (
						<div className="mt-6">
							<a href="/login" className="text-red-600 hover:text-red-700 font-medium underline">
								Log in for personalized recommendations based on your history
							</a>
						</div>
					) }
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Controls Section */ }
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-10 transition-all hover:shadow-md">
					<div className="grid md:grid-cols-2 gap-10">
						{/* Budget Slider */ }
						<div className="relative">
							<div className="flex justify-between items-end mb-4">
								<label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
									<span>💰</span> Max Budget
								</label>
								<span className="text-2xl font-bold text-red-700">${ budget }</span>
							</div>
							<input
								type="range"
								min="5"
								max="50"
								step="1"
								value={ budget }
								onChange={ (e) => setBudget(Number(e.target.value)) }
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
							/>
							<div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
								<span>$5</span>
								<span>$25</span>
								<span>$50</span>
							</div>
						</div>

						{/* Time Slider */ }
						<div className="relative">
							<div className="flex justify-between items-end mb-4">
								<label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
									<span>⏱️</span> Max Prep Time
								</label>
								<span className="text-2xl font-bold text-blue-700">{ timeAvailable } min</span>
							</div>
							<input
								type="range"
								min="5"
								max="60"
								step="5"
								value={ timeAvailable }
								onChange={ (e) => setTimeAvailable(Number(e.target.value)) }
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
							/>
							<div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
								<span>5m</span>
								<span>30m</span>
								<span>60m</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */ }
					<div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
						<button
							onClick={ handleFindSuggestions }
							disabled={ loading }
							className="bg-red-700 hover:bg-red-800 text-white font-bold text-lg px-12 py-3 rounded-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-red-200"
						>
							{ loading ? (
								<span className="flex items-center gap-2">
									<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Analyzing...
								</span>
							) : (
								"Find My Meal"
							) }
						</button>

						{ user && (
							<button
								onClick={ handleUpdatePreferences }
								disabled={ refreshing || loading }
								className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-lg px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
							>
								{ refreshing ? "Updating..." : "🔄 Refresh Preferences" }
							</button>
						) }
					</div>
				</div>

				{/* Error Message */ }
				{ error && (
					<div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm mb-8 animate-fade-in">
						<p className="font-bold">Error</p>
						<p>{ error }</p>
					</div>
				) }

				{/* Results Grid */ }
				{ !loading && hasSearched && (
					<div className="animate-fade-in-up">
						{ suggestions.length > 0 ? (
							<>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-gray-800">
										Top Recommendations
									</h2>
									<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
										{ suggestions.length } items found
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{ suggestions.map((item) => (
										<div key={ item._id } className="relative group">
											{/* Match Score Badge (if personalized) */ }
											{ item.score && (
												<div className="absolute -top-3 -right-3 z-10">
													<div className={ `shadow-lg rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm border-2 ${getScoreColor(item.score)}` }>
														{ Math.round(item.score * 100) }%
													</div>
												</div>
											) }

											<div className="h-full transform transition-all duration-300 hover:-translate-y-1">
												<MenuItemCard item={ item } onAdd={ () => addToCart(item) }>
													{/* Reasons Overlay/Footer */ }
													{ item.reasons && item.reasons.length > 0 && (
														<div className="flex flex-wrap gap-2">
															{ item.reasons.slice(0, 3).map((reason, idx) => (
																<span
																	key={ idx }
																	className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100"
																>
																	{ reason }
																</span>
															)) }
														</div>
													) }
												</MenuItemCard>
											</div>
										</div>
									)) }
								</div>
							</>
						) : (
							<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
								<div className="text-6xl mb-6 opacity-50">🔍</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-3">
									No matches found
								</h3>
								<p className="text-gray-500 max-w-md mx-auto">
									We couldn&apos;t find any items matching your strict criteria. Try increasing your budget or time available.
								</p>
								<button
									onClick={ () => {
										setBudget(30);
										setTimeAvailable(45);
									} }
									className="mt-6 text-red-600 font-medium hover:underline"
								>
									Reset filters to defaults
								</button>
							</div>
						) }
					</div>
				) }

				{/* Initial State / Empty State */ }
				{ !loading && !hasSearched && (
					<div className="text-center py-12 opacity-60">
						<div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
							<span className="text-4xl">👈</span>
						</div>
						<p className="text-gray-500 text-lg">
							Adjust the sliders above and click &quot;Find My Meal&quot; to get started
						</p>
					</div>
				) }
			</div>
		</div>
	);
}
