/* eslint-disable */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { Drink, CategoryManager, DrinksManager } = require('./frontend/src/drinkForm.js');  // Import relevant classes for handling drinks
const { v4: uuidv4 } = require('uuid');  // For generating unique IDs for drinks
const cors = require('cors');  // Enable Cross-Origin Resource Sharing for frontend-backend communication

const app = express();
const port = 3001;  // API server port

// Enable CORS with specific allowed origin and methods
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
}));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Logging incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path} Received request`);
    next();
});

// Utility function to read and parse the JSON file for storing drinks
const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data) {
            console.warn('File is empty, initialising with default structure.');
            return { drinks: [] };  // Default structure if file is empty
        }
        return JSON.parse(data);  // Return parsed data from JSON file
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
        console.warn('Reinitialising file with default structure.');
        return { drinks: [] };  // Return default structure in case of error
    }
};

// Validate the fields of a drink to ensure all required data is present and valid
const validateDrinkFields = (fields) => {
    const { name, category, ingredients, glass, alcoholContent, allergens } = fields;

    // Check for missing or invalid fields
    if (!name || !category || !ingredients || !glass || alcoholContent === undefined || allergens === undefined) {
        return 'Missing required fields';
    }
    if (!Array.isArray(ingredients) || ingredients.some(i => typeof i !== 'string')) {
        return 'Ingredients must be an array of strings';
    }

    // Validate the category
    const validCategories = ["cocktail", "mocktail", "other"];
    if (!validCategories.includes(category.toLowerCase())) {
        return 'Invalid category. Please choose from cocktail, mocktail, or other.';
    }

    return null;  // Return null if validation is successful
};

// Routes for handling API requests

// Get all drinks
app.get('/api/drinks', (req, res) => {
    try {
        const drinksManager = new DrinksManager();
        const drinks = drinksManager.getAllDrinks();  // Fetch all drinks
        if (drinks.length === 0) {
            return res.status(404).json({ message: 'No drinks available' });
        }
        res.status(200).json({ message: 'Drinks list retrieved successfully', drinks });
    } catch (error) {
        console.error("Error fetching drinks:", error);
        res.status(500).json({ message: 'Error fetching drinks', error: error.message });
    }
});

// Get drinks by category
app.get('/api/drinks/category/:category', (req, res) => {
    try {
        const category = req.params.category.trim().toLowerCase();  // Clean and normalize category name
        const categoryManager = new CategoryManager();
        const drinksInCategory = categoryManager.getDrinksByCategory(category);

        if (drinksInCategory.length === 0) {
            return res.status(404).json({ message: `No drinks found in the '${category}' category` });
        }
        res.status(200).json(drinksInCategory);  // Return filtered drinks by category
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: 'Error fetching drinks by category', error: error.message });
    }
});

// Get a single drink by ID
app.get('/api/drinks/:id', (req, res) => {
    const id = req.params.id;  // Get drink ID from URL

    const drinksManager = new DrinksManager();
    const allDrinks = drinksManager.getAllDrinks();
    try {
        const drink = allDrinks.find(drink => drink.id === id);  // Find the drink by ID

        if (!drink) {
            return res.status(404).json({ message: 'Drink not found' });
        }
        res.status(200).json({ message: 'Drink found', drink });  // Return the found drink
    } catch (error) {
        console.error("Error retrieving drink by ID:", error);
        res.status(404).json({ message: "Error retrieving drink by ID", error: error.message });
    }
});

// Add a new drink
app.post('/api/drinks', (req, res) => {
    try {
        const validationError = validateDrinkFields(req.body);  // Validate incoming drink data
        if (validationError) {
            return res.status(400).json({ message: validationError });  // Return validation error
        }

        const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;
        const newDrink = new Drink(name, category, ingredients, glass, alcoholContent, allergens);
        newDrink.id = uuidv4();  // Assign unique ID to the new drink

        const drinksManager = new DrinksManager();
        if (drinksManager.findDuplicate(newDrink)) {
            return res.status(400).json({ message: "Drink already exists in this category." });  // Avoid duplicates
        }

        drinksManager.addDrink(newDrink);  // Add the new drink
        res.status(201).json({ id: newDrink.id, message: "Drink added successfully!" });  // Success response
    } catch (error) {
        console.error("Error adding drink:", error);
        res.status(500).json({ message: "Error adding drink", error: error.message });
    }
});

// Delete a drink by ID
app.delete('/api/drinks/:id', (req, res) => {
    try {
        const id = req.params.id;  // Get drink ID from URL

        const drinksManager = new DrinksManager();
        const removedDrink = drinksManager.removeDrink(id);  // Remove the drink by ID

        if (!removedDrink) {
            return res.status(404).json({ message: "Drink not found" });
        }

        res.status(200).json({ id, message: "Drink removed successfully!" });  // Success response
    } catch (error) {
        console.error("Error removing drink:", error);
        res.status(500).json({ message: "Error removing drink", error: error.message });
    }
});

// Update a drink by ID
app.put('/api/drinks/:id', (req, res) => {
    const id = req.params.id;  // Get drink ID from URL

    const drinksManager = new DrinksManager();
    const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;

    const updatedDrinkDetails = {
        name,
        category,
        ingredients,
        glass,
        alcoholContent,
        allergens,
    };

    try {
        const updatedDrink = drinksManager.updateDrink(id, updatedDrinkDetails);  // Update the drink
        res.status(200).json({
            message: 'Drink updated successfully',
            drink: updatedDrink  // Return updated drink details
        });
    } catch (error) {
        console.error("Error updating drink:", error);
        res.status(500).json({
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = { app, readJSONFile };  // Export the app and utility function for testing
