import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageIngredients() {
	const [ingredients, setIngredients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showAddForm, setShowAddForm] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		price: "",
		category: "topping",
		allergens: [],
		dietaryTags: [],
		available: true,
		image: "",
	});

	const categories = ["base", "topping", "flavoring", "protein", "vegetable", "bread", "dairy", "other"];
	const allergenOptions = ["dairy", "nuts", "gluten", "soy", "eggs", "shellfish", "fish"];
	const dietaryTagOptions = ["vegan", "vegetarian", "keto", "gluten-free", "dairy-free", "nut-free"];

	useEffect(() => {
		fetchIngredients();
	}, []);

	const fetchIngredients = async () => {
		try {
			const res = await api.get("/ingredients");
			setIngredients(res.data.ingredients || []);
		} catch {
			setError("Failed to load ingredients");
		} finally {
			setLoading(false);
		}
	};

	const toggleAvailability = async (id, available) => {
		try {
			await api.put(`/ingredients/${id}`, { available: !available });
			setIngredients((prev) =>
				prev.map((ing) =>
					ing._id === id ? { ...ing, available: !available } : ing
				)
			);
		} catch (err) {
			console.error("Error updating ingredient availability:", err);
			alert("Error updating ingredient availability");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this ingredient?")) {
			return;
		}
		try {
			await api.delete(`/ingredients/${id}`);
			setIngredients((prev) => prev.filter((ing) => ing._id !== id));
			alert("Ingredient deleted successfully");
		} catch (err) {
			console.error("Error deleting ingredient:", err);
			alert("Error deleting ingredient");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				...formData,
				price: parseFloat(formData.price),
			};
			const res = await api.post("/ingredients", payload);
			setIngredients((prev) => [...prev, res.data.ingredient]);
			setShowAddForm(false);
			setFormData({
				name: "",
				price: "",
				category: "topping",
				allergens: [],
				dietaryTags: [],
				available: true,
				image: "",
			});
			alert("Ingredient added successfully!");
		} catch (err) {
			console.error("Error adding ingredient:", err);
			alert(err.response?.data?.message || "Error adding ingredient");
		}
	};

	const handleCheckboxChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: prev[field].includes(value)
				? prev[field].filter((v) => v !== value)
				: [...prev[field], value],
		}));
	};

	if (loading) return <p className="p-4">Loading ingredients...</p>;
	if (error) return <p className="p-4 text-red-600">{ error }</p>;

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold text-red-800">Manage Ingredients</h1>
				<button
					onClick={ () => setShowAddForm(!showAddForm) }
					className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
				>
					{ showAddForm ? "Cancel" : "+ Add Ingredient" }
				</button>
			</div>

			{/* Add Ingredient Form */ }
			{ showAddForm && (
				<div className="bg-white rounded-xl shadow-md p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Ingredient</h2>
					<form onSubmit={ handleSubmit } className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Name *
							</label>
							<input
								type="text"
								required
								value={ formData.name }
								onChange={ (e) => setFormData({ ...formData, name: e.target.value }) }
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Price ($) *
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								required
								value={ formData.price }
								onChange={ (e) => setFormData({ ...formData, price: e.target.value }) }
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Category *
							</label>
							<select
								value={ formData.category }
								onChange={ (e) => setFormData({ ...formData, category: e.target.value }) }
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
							>
								{ categories.map((cat) => (
									<option key={ cat } value={ cat }>
										{ cat }
									</option>
								)) }
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Image URL
							</label>
							<input
								type="text"
								value={ formData.image }
								onChange={ (e) => setFormData({ ...formData, image: e.target.value }) }
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
								placeholder="https://..."
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Allergens
							</label>
							<div className="flex flex-wrap gap-2">
								{ allergenOptions.map((allergen) => (
									<label key={ allergen } className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={ formData.allergens.includes(allergen) }
											onChange={ () => handleCheckboxChange("allergens", allergen) }
											className="w-4 h-4"
										/>
										<span className="text-sm">{ allergen }</span>
									</label>
								)) }
							</div>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Dietary Tags
							</label>
							<div className="flex flex-wrap gap-2">
								{ dietaryTagOptions.map((tag) => (
									<label key={ tag } className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={ formData.dietaryTags.includes(tag) }
											onChange={ () => handleCheckboxChange("dietaryTags", tag) }
											className="w-4 h-4"
										/>
										<span className="text-sm">{ tag }</span>
									</label>
								)) }
							</div>
						</div>

						<div className="md:col-span-2 flex justify-end gap-3">
							<button
								type="button"
								onClick={ () => setShowAddForm(false) }
								className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
							>
								Add Ingredient
							</button>
						</div>
					</form>
				</div>
			) }

			{/* Ingredients Table */ }
			<div className="bg-white rounded-xl shadow-md overflow-hidden">
				<table className="w-full">
					<thead className="bg-gray-50 border-b">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Price
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Allergens
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Dietary Tags
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{ ingredients.map((ingredient) => (
							<tr key={ ingredient._id } className={ !ingredient.available ? "bg-gray-50" : "" }>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										{ ingredient.image && (
											<img
												src={ ingredient.image }
												alt={ ingredient.name }
												className="w-10 h-10 rounded-lg object-cover mr-3"
											/>
										) }
										<span className="font-medium text-gray-900">{ ingredient.name }</span>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
									{ ingredient.category }
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									${ ingredient.price.toFixed(2) }
								</td>
								<td className="px-6 py-4 text-sm text-gray-700">
									{ ingredient.allergens && ingredient.allergens.length > 0 ? (
										<div className="flex flex-wrap gap-1">
											{ ingredient.allergens.map((allergen) => (
												<span
													key={ allergen }
													className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
												>
													{ allergen }
												</span>
											)) }
										</div>
									) : (
										<span className="text-gray-400">None</span>
									) }
								</td>
								<td className="px-6 py-4 text-sm text-gray-700">
									{ ingredient.dietaryTags && ingredient.dietaryTags.length > 0 ? (
										<div className="flex flex-wrap gap-1">
											{ ingredient.dietaryTags.map((tag) => (
												<span
													key={ tag }
													className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
												>
													{ tag }
												</span>
											)) }
										</div>
									) : (
										<span className="text-gray-400">None</span>
									) }
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={ `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ingredient.available
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
											}` }
									>
										{ ingredient.available ? "Available" : "Unavailable" }
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<button
										onClick={ () => toggleAvailability(ingredient._id, ingredient.available) }
										className={ `mr-3 ${ingredient.available ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"
											}` }
									>
										{ ingredient.available ? "Disable" : "Enable" }
									</button>
									<button
										onClick={ () => handleDelete(ingredient._id) }
										className="text-red-600 hover:text-red-900"
									>
										Delete
									</button>
								</td>
							</tr>
						)) }
					</tbody>
				</table>
			</div>
		</div>
	);
}
