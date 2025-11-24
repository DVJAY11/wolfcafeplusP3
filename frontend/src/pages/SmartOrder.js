import React, { useState } from "react";
import api from "../api/axios";
import MenuItemCard from "../components/MenuItemCard";

export default function SmartOrder() {
	const [budget, setBudget] = useState(50);
	const [timeAvailable, setTimeAvailable] = useState(15);
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

	const handleFindSuggestions = async () => {
		setLoading(true);
		setError("");
		setHasSearched(true);

		try {
			const res = await api.get("/recommend/smart-suggestions", {
				params: { budget, timeAvailable }
			});
			setSuggestions(res.data.suggestions || []);
		} catch (err) {
			console.error("❌ Failed to fetch suggestions:", err);
			setError(err.response?.data?.message || "Failed to load suggestions");
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */ }
				<div className="text-center mb-10">
					<h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
						<span>🤖</span>
						<span>Smart Order</span>
					</h1>
					<p className="text-lg text-gray-600">
						Find the perfect meal within your budget and time constraints
					</p>
				</div>

				{/* Controls Card */ }
				<div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
					<div className="grid md:grid-cols-2 gap-8">
						{/* Budget Slider */ }
						<div>
							<label className="block text-lg font-semibold text-gray-700 mb-3">
								Budget: ${ budget }
							</label>
							<input
								type="range"
								min="0"
								max="200"
								value={ budget }
								onChange={ (e) => setBudget(Number(e.target.value)) }
								className="w-full h-3 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer slider"
								style={ {
									accentColor: '#dc2626'
								} }
							/>
							<div className="flex justify-between text-sm text-gray-500 mt-2">
								<span>$0</span>
								<span>$200</span>
							</div>
						</div>

						{/* Time Selector */ }
						<div>
							<label className="block text-lg font-semibold text-gray-700 mb-3">
								Preparation Time: { timeAvailable } mins
							</label>
							<input
								type="range"
								min="5"
								max="60"
								step="5"
								value={ timeAvailable }
								onChange={ (e) => setTimeAvailable(Number(e.target.value)) }
								className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
								style={ {
									accentColor: '#dc2626'
								} }
							/>
							<div className="flex justify-between text-sm text-gray-500 mt-2">
								<span>5 mins</span>
								<span>60 mins</span>
							</div>
						</div>
					</div>

					{/* Find Suggestions Button */ }
					<div className="text-center mt-8">
						<button
							onClick={ handleFindSuggestions }
							disabled={ loading }
							className="bg-red-700 hover:bg-red-800 text-white font-bold text-lg px-10 py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
						>
							{ loading ? "Finding..." : "Find Suggestions" }
						</button>
					</div>
				</div>

				{/* Error Message */ }
				{ error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6">
						{ error }
					</div>
				) }

				{/* Loading State */ }
				{ loading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-xl text-gray-600">Loading suggestions...</div>
					</div>
				) }

				{/* Results Grid */ }
				{ !loading && hasSearched && (
					<>
						{ suggestions.length > 0 ? (
							<>
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-gray-800">
										{ suggestions.length } { suggestions.length === 1 ? "Suggestion" : "Suggestions" } Found
									</h2>
									<p className="text-gray-600">
										Based on ${ budget } budget and { timeAvailable } minutes available
									</p>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{ suggestions.map((item) => (
										<div key={ item._id } className="relative">
											<MenuItemCard item={ item } />

											{/* Reason Tags */ }
											{ item.reasons && item.reasons.length > 0 && (
												<div className="mt-3 flex flex-wrap gap-2">
													{ item.reasons.map((reason, idx) => (
														<span
															key={ idx }
															className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full"
														>
															✓ { reason }
														</span>
													)) }
												</div>
											) }

											{/* Prep Time Badge */ }
											{ item.prepTime && (
												<div className="mt-2">
													<span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
														⏱️ { item.prepTime } min prep
													</span>
												</div>
											) }
										</div>
									)) }
								</div>
							</>
						) : (
							<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
								<div className="text-6xl mb-4">😔</div>
								<h3 className="text-2xl font-bold text-gray-800 mb-2">
									No Suggestions Found
								</h3>
								<p className="text-gray-600">
									Try adjusting your budget or time constraints to see more options
								</p>
							</div>
						) }
					</>
				) }

				{/* Initial State */ }
				{ !loading && !hasSearched && (
					<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
						<div className="text-6xl mb-4">🍽️</div>
						<h3 className="text-2xl font-bold text-gray-800 mb-2">
							Ready to Find Your Perfect Meal?
						</h3>
						<p className="text-gray-600">
							Set your budget and time, then click "Find Suggestions" to get started
						</p>
					</div>
				) }
			</div>
		</div>
	);
}
