// src/pages/store/RecipeManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion } from 'framer-motion';

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    category: 'main'
  });
  const [ingredients, setIngredients] = useState([{ food_item_id: '', quantity_required: '', unit: 'kg' }]);

  useEffect(() => {
    fetchRecipes();
    fetchInventory();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(
            *,
            food_inventory(food_item)
          )
        `)
        .order('dish_name');

      if (!error) setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('food_inventory')
        .select('id, food_item, unit')
        .eq('status', 'active')
        .order('food_item');

      if (!error) setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([formData])
        .select();

      if (recipeError) throw recipeError;

      // Create recipe ingredients
      const recipeId = recipeData[0].id;
      const ingredientsData = ingredients
        .filter(ing => ing.food_item_id && ing.quantity_required)
        .map(ing => ({
          recipe_id: recipeId,
          food_item_id: ing.food_item_id,
          quantity_required: parseFloat(ing.quantity_required),
          unit: ing.unit
        }));

      if (ingredientsData.length > 0) {
        const { error: ingError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingError) throw ingError;
      }

      alert('Recipe created successfully!');
      setShowForm(false);
      setFormData({ dish_name: '', description: '', category: 'main' });
      setIngredients([{ food_item_id: '', quantity_required: '', unit: 'kg' }]);
      fetchRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Error creating recipe: ' + error.message);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { food_item_id: '', quantity_required: '', unit: 'kg' }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const calculateDishCost = (recipe) => {
    if (!recipe.recipe_ingredients) return 0;
    return recipe.recipe_ingredients.reduce((total, ing) => {
      const inventoryItem = inventory.find(item => item.id === ing.food_item_id);
      const unitPrice = inventoryItem?.unit_price || 1;
      return total + (ing.quantity_required * unitPrice);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recipe Management
          </h1>
          <p className="text-gray-600 text-lg">Manage dish recipes and their ingredients</p>
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg"
          >
            Add New Recipe
          </motion.button>
        </div>

        {/* Recipe Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Add New Recipe</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dish Name</label>
                  <input
                    type="text"
                    value={formData.dish_name}
                    onChange={(e) => setFormData({...formData, dish_name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={ingredient.food_item_id}
                        onChange={(e) => updateIngredient(index, 'food_item_id', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Ingredient</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.food_item}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={ingredient.quantity_required}
                        onChange={(e) => updateIngredient(index, 'quantity_required', e.target.value)}
                        placeholder="Quantity"
                        className="w-24 p-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="piece">piece</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Add Ingredient
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    Save Recipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.dish_name}</h3>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
                <ul className="space-y-1">
                  {recipe.recipe_ingredients?.map((ing, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {ing.food_inventory?.food_item}: {ing.quantity_required} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Est. Cost: ${calculateDishCost(recipe).toFixed(2)}
                </span>
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {recipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-2xl shadow-lg"
          >
            <div className="text-6xl mb-4">🍲</div>
            <p className="text-gray-500 text-lg">No recipes found</p>
            <p className="text-gray-400">Create your first recipe to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecipeManagement;