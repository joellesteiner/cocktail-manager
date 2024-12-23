import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DrinkForm from 'frontend/src/DrinkList.js';
import DrinkList from 'frontend/src/drinkForm.js';


const App = () => {
    const [drinks, setDrinks] = useState([]);
    const [editDrink, setEditDrink] = useState(null);

    useEffect(() => {
        const loadDrinks = async () => {
            await fetchDrinks(); // Ensure the promise is awaited here
        };
        loadDrinks()
            .then(() => console.log('Drinks loaded successfully'))
            .catch((err) => console.error('Error in loadDrinks:', err));

    }, []);


    const fetchDrinks = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/drinks'); // Update this URL if necessary
            if (response && response.data) {
                setDrinks(response.data.drinks || []);
            } else {
                console.error("Unexpected response structure:", response);
            }
        } catch (error) {
            console.error('Error fetching drinks:', error.message);
        }
    };


    const addOrUpdateDrink = async (drinkData) => {
        try {
            if (editDrink) {
                await axios.put(`http://localhost:3000/api/drinks/${editDrink.id}`, drinkData);
            } else {
                await axios.post('http://localhost:3000/api/drinks', drinkData);
            }
            await fetchDrinks();
            setEditDrink(null);
        } catch (error) {
            console.error('Error saving drink:', error);
        }
    };


    const deleteDrink = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/drinks/${id}`);
            await fetchDrinks();
        } catch (error) {
            console.error('Error deleting drink:', error);
        }
    };
    return (
        <div className="App">
            <h1>Drink Manager</h1>
            <DrinkForm onSave={addOrUpdateDrink} editDrink={editDrink} />
            <DrinkList
                drinks={drinks}
                onDelete={deleteDrink}
                onEdit={(drink) => setEditDrink(drink)}
            />
        </div>
    );
};

export default App;
