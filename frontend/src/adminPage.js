import React, { useState } from 'react';
import axios from 'axios';
import DrinkList from './DrinkList.js';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './App.css';

const AdminPage = ({ goToHome, fetchDrinks, setDrinks, drinks }) => {
    // Form state
    const [drinkName, setDrinkName] = useState('');
    const [category, setCategory] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [glass, setGlass] = useState('');
    const [alcoholContent, setAlcoholContent] = useState('');
    const [allergens, setAllergens] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentDrink, setCurrentDrink] = useState(null);

    const categories = ['cocktail', 'mocktail', 'other'];

    // Prepare category data for pie chart
    const getCategoryData = () => {
        const categoryCount = categories.map((cat) => ({
            name: cat,
            value: drinks.filter((drink) => drink.category === cat).length,
        }));
        return categoryCount.filter((data) => data.value > 0);
    };

    const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Colors for pie segments

    // Handle form submit (add or update drink)
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate form input
        if (!drinkName.trim() || !category.trim() || !ingredients.trim() || !glass.trim()) {
            alert('All fields are required.');
            return;
        }

        const drinkData = {
            name: drinkName.trim(),
            category: category.trim(),
            ingredients: ingredients.split(',').map((item) => item.trim()),
            glass: glass.trim(),
            alcoholContent: parseInt(alcoholContent) || 0,
            allergens: allergens.split(',').map((item) => item.trim()),
        };

        try {
            // Update or add drink
            if (editMode && currentDrink) {
                await axios.put(`http://localhost:3001/api/drinks/${currentDrink.id}`, drinkData);
            } else {
                await axios.post('http://localhost:3001/api/drinks', drinkData);
            }
            await fetchDrinks(); // Refresh the drink list
            clearForm(); // Reset form
        } catch (error) {
            console.error('Error saving drink:', error.response?.data || error.message);
        }
    };

    // Handle drink deletion
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/drinks/${id}`);
            setDrinks((prevDrinks) => prevDrinks.filter((drink) => drink.id !== id)); // Remove from state
        } catch (error) {
            console.error('Error deleting drink:', error.message);
        }
    };

    // Set form fields for editing a drink
    const handleEdit = (drink) => {
        setDrinkName(drink.name);
        setCategory(drink.category);
        setIngredients(drink.ingredients.join(', '));
        setGlass(drink.glass);
        setAlcoholContent(drink.alcoholContent.toString());
        setAllergens(drink.allergens.join(', '));
        setEditMode(true); // Switch to edit mode
        setCurrentDrink(drink); // Set current drink for update
    };

    // Clear form fields
    const clearForm = () => {
        setDrinkName('');
        setCategory('');
        setIngredients('');
        setGlass('');
        setAlcoholContent('');
        setAllergens('');
        setEditMode(false);
        setCurrentDrink(null);
    };

    return (
        <div className="App">
            <button onClick={goToHome}>Go Home</button>
            <h1>Drink Manager</h1>

            <form onSubmit={handleSubmit}>
                <label>Drink Name:</label>
                <input
                    type="text"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                />

                <label>Category:</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <label>Ingredients (comma separated):</label>
                <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                />

                <label>Glass Type:</label>
                <input
                    type="text"
                    value={glass}
                    onChange={(e) => setGlass(e.target.value)}
                />

                <label>Alcohol Content:</label>
                <input
                    type="number"
                    value={alcoholContent}
                    onChange={(e) => setAlcoholContent(e.target.value)}
                />

                <label>Allergens (comma separated):</label>
                <input
                    type="text"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                />

                <button type="submit">{editMode ? 'Update Drink' : 'Add Drink'}</button>
            </form>

            {/* Drink list */}
            <DrinkList
                drinks={drinks}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isAdmin={true}
                currentCategory={category}
            />

            {/* Pie chart showing drink category distribution */}
            <div style={{ marginTop: '30px' }}>
                <h2>Drink Categories Distribution</h2>
                <PieChart width={400} height={300}>
                    <Pie
                        data={getCategoryData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                    >
                        {getCategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
};

export default AdminPage;
