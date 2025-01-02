import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DrinkList from './DrinkList.js';
import './App.css';

const App = () => {
    const [drinks, setDrinks] = useState([]);
    const [drinkName, setDrinkName] = useState('');
    const [category, setCategory] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [glass, setGlass] = useState('');
    const [alcoholContent, setAlcoholContent] = useState('');
    const [allergens, setAllergens] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentDrink, setCurrentDrink] = useState(null);

    const categories = ['cocktail', 'mocktail', 'other'];

    useEffect(() => {
        const loadDrinks = async () => {
            try {
                await fetchDrinks();
                console.log('Drinks loaded successfully');
            } catch (err) {
                console.error('Error in loadDrinks:', err);
            }
        };

        loadDrinks();

    }, []);

    const fetchDrinks = async (category = '') => {
        try {
            const url = category
                ? `http://localhost:3001/api/drinks/category/${category}`
                : 'http://localhost:3001/api/drinks';

            console.log('Fetching drinks from URL:', url);  // Debug log
            const response = await axios.get(url);
            setDrinks(response.data.drinks || []);
        } catch (error) {
            console.error('Error fetching drinks:', error.message);
        }
    };

    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        console.log('Category Selected:', selectedCategory);
        setCategory(selectedCategory);
        fetchDrinks(selectedCategory);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

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

        console.log('Data being sent to server:', drinkData);

        try {
             if (editMode && currentDrink) {
                console.log('Sending PUT request for ID:', currentDrink.id);
                await axios.put(`http://localhost:3001/api/drinks/${currentDrink.id}`, drinkData);
            } else {
                console.log('Sending POST request...');
                await axios.post('http://localhost:3001/api/drinks', drinkData);
             }

            console.log(currentDrink.id, drinkData)

            await fetchDrinks();
            clearForm();
        } catch (error) {
            console.error('Error saving drink:', error.response?.data || error.message);
        }
    };


    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/drinks/${id}`);
            setDrinks((prevDrinks) => prevDrinks.filter((drink) => drink.id !== id));
            console.log('Drink deleted successfully');
        } catch (error) {
            console.error('Error deleting drink:', error.message);
        }
    };

    const handleEdit = (drink) => {
        const ingredientsArray = Array.isArray(drink.ingredients) ? drink.ingredients : [];
        const allergensArray = Array.isArray(drink.allergens) ? drink.allergens : [];

        setDrinkName(drink.name);
        setCategory(drink.category);
        setIngredients(ingredientsArray.join(', '));
        setGlass(drink.glass);
        setAlcoholContent(drink.alcoholContent.toString());
        setAllergens(allergensArray.join(', '));

        setEditMode(true);
        setCurrentDrink(drink);
    };

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
            <h1>Drink Manager</h1>
            <form onSubmit={handleSubmit}>
                <label>Drink Name:</label>
                <input
                    type="text"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                />
                <label>Category:</label>
                <select
                    value={category}
                    onChange={handleCategoryChange}
                >
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
                <label>Glass:</label>
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

            <DrinkList drinks={drinks} onDelete={handleDelete} onEdit={handleEdit} currentCategory={category} />
        </div>
    );
};

export default App;

