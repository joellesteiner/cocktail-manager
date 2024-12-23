// src/components/DrinkList.js
import React from 'react';

const DrinkList = ({ drinks, onDelete, onEdit }) => {
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
                            <button onClick={() => onEdit(drink)}>Edit</button>
                            <button onClick={() => onDelete(drink.id)}>Delete</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default DrinkList;
