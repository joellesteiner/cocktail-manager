import React, { useState } from 'react';

const DrinkList = ({ drinks, onDelete, onEdit, isAdmin }) => {
    const [currentCategory, setCurrentCategory] = useState("");

    const handleDeleteClick = (id) => {
        if (id && onDelete) {
            onDelete(id);
        } else {
            console.error("No ID found for this drink.");
        }
    };

    const handleEditClick = (drink) => {
        if (drink && onEdit) {
            onEdit(id);
        } else {
            console.error("No drink found.");
        }
    };



    const handleCategoryChange = (event) => {
        setCurrentCategory(event.target.value);
    };

    const filteredDrinks = drinks.filter(
        (drink) => currentCategory === "" || drink.category === currentCategory
    );

    const categories = ["cocktail", "mocktail", "other"];

    return (
        <div className="drink-list">
            <h2>Drinks List</h2>

            {/* Category Selector */}
            {isAdmin && (
                <div className="category-filter">
                    <label htmlFor="category-select">Filter by Category: </label>
                    <select
                        id="category-select"
                        value={currentCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Drinks List */}
            <ul>
                {filteredDrinks.length === 0 ? (
                    <li>No drinks available in this category.</li>
                ) : (
                    filteredDrinks.map((drink) => (
                        <li key={drink.id} className="drink-item">
                            <div>
                                <strong>{drink.name}</strong> ({drink.category})
                                <br />
                                <span>Ingredients: {drink.ingredients?.join(", ")}</span>
                                <br />
                                <span>Glass: {drink.glass}</span>
                                <br />
                                <span>Alcohol Content: {drink.alcoholContent}%</span>
                                <br />
                                <span>Allergens: {drink.allergens?.join(", ") || "None"}</span>
                            </div>

                            {isAdmin && (
                                <div className="admin-controls">
                                    <div className="button-group">
                                        <button className="edit-button" onClick={() => handleEditClick(drink)}>
                                            Edit
                                        </button>
                                        <button className="delete-button" onClick={() => handleDeleteClick(drink.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}

                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default DrinkList;

