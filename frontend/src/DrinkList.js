import React, { useState } from 'react';

const DrinkList = ({ drinks, onDelete, onEdit }) => {
    const [currentCategory, setCurrentCategory] = useState("");

    const handleDeleteClick = (id) => {
        console.log(`Attempting to delete drink with ID: ${id}`);
        if (id) {
            onDelete(id);
        } else {
            console.log("No ID found for this drink");
        }
    };

    const handleCategoryChange = (event) => {
        setCurrentCategory(event.target.value);
    };

    const filterDrinks = (drink) => {
        console.log(drink.category, currentCategory);
        return currentCategory === "" || drink.category === currentCategory;
    };

    const categories = ['cocktail', 'mocktail', 'other'];

    return (
        <div>
            <h2>Drinks List</h2>
            <select
                value={currentCategory}
                onChange={handleCategoryChange}
            >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>
            <ul>
                {drinks.length === 0 ? (
                    <li>No drinks available. Please add some drinks!</li>
                ) : (
                    drinks.filter(filterDrinks).map((drink) => (
                        <li key={drink.id}>
                            <strong>{drink.name}</strong> ({drink.category})
                            <button onClick={() => handleDeleteClick(drink.id)}>Delete</button>
                            <button onClick={() => onEdit(drink)}>Edit</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default DrinkList;

