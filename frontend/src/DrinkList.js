import React from 'react';

const DrinkList = ({ drinks, onDelete, onEdit }) => {
    const handleDeleteClick = (id) => {
        console.log(`Attempting to delete drink with ID: ${id}`);
        if (id) {
            onDelete(id);
        } else {
            console.log("No ID found for this drink");
        }
    };

    return (
        <div>
            <h2>Drinks List</h2>
            <ul>
                {drinks.length === 0 ? (
                    <li>No drinks available. Please add some drinks!</li>
                ) : (
                    drinks.map((drink) => (
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

