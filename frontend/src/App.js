import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DrinkList from 'frontend/src/DrinkList.js';

const App = () => {
    const [drinks, setDrinks] = useState([]);
    const [drinkName, setDrinkName] = useState('');
    const [category, setCategory] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [glass, setGlass] = useState('');
    const [alcoholContent, setAlcoholContent] = useState('');
    const [allergens, setAllergens] = useState('');

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

    const fetchDrinks = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/drinks');
            setDrinks(response.data.drinks || []); // Update the drinks state
        } catch (error) {
            console.error('Error fetching drinks:', error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const drinkData = {
            name: drinkName,
            category,
            ingredients: ingredients.split(', '),
            glass,
            alcoholContent: parseFloat(alcoholContent),
            allergens: allergens.split(', '),
        };

        try {
            await axios.post('http://localhost:3001/api/drinks', drinkData);
            await fetchDrinks();
            clearForm();
        } catch (error) {
            console.error('Error saving drink:', error);
        }
    };

    const clearForm = () => {
        setDrinkName('');
        setCategory('');
        setIngredients('');
        setGlass('');
        setAlcoholContent('');
        setAllergens('');
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
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
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
                <button type="submit">Add Drink</button>
            </form>

            <DrinkList drinks={drinks} />
        </div>
    );
};

export default App;
