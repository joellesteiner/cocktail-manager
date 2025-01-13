const express = require('express');
const path = require('path');
const fs = require('fs');
const { Drink, CategoryManager, DrinksManager } = require('./frontend/src/drinkForm.js');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const filePath = path.join(__dirname, 'frontend', 'src', 'drinks.json');


const app = express();
const port = 3001;

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path} Received request`);
    next();
});

// Utility: Read JSON file
const readJSONFile = (filePath) => {
    try {
        // Correct file path
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data) {
            console.warn('File is empty, initializing with default structure.');
            return { drinks: [] };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
        console.warn('Reinitializing file with default structure.');
        return { drinks: [] };
    }
};

// Utility: Validate drink fields
const validateDrinkFields = (fields) => {
    const { name, category, ingredients, glass, alcoholContent, allergens } = fields;
    if (!name || !category || !ingredients || !glass || alcoholContent === undefined || allergens === undefined) {
        return 'Missing required fields';
    }
    if (!Array.isArray(ingredients) || ingredients.some(i => typeof i !== 'string')) {
        return 'Ingredients must be an array of strings';
    }
    const validCategories = ["cocktail", "mocktail", "other"];
    if (!validCategories.includes(category.toLowerCase())) {
        return 'Invalid category. Please choose from cocktail, mocktail, or other.';
    }
    return null;
};

// Routes
app.get('/api/drinks', (req, res) => {
    try {
        const drinksManager = new DrinksManager();
        const drinks = drinksManager.getAllDrinks();
        if (drinks.length === 0) {
            return res.status(404).json({ message: 'No drinks available' });
        }
        res.status(200).json({ message: 'Drinks list retrieved successfully', drinks });
    } catch (error) {
        console.error("Error fetching drinks:", error);
        res.status(500).json({ message: 'Error fetching drinks', error: error.message });
    }
});

app.get('/api/drinks/category/:category', (req, res) => {
    try {
        const category = req.params.category.trim().toLowerCase();
        const categoryManager = new CategoryManager();
        const drinksInCategory = categoryManager.getDrinksByCategory(category);

        if (drinksInCategory.length === 0) {
            return res.status(404).json({ message: `No drinks found in the '${category}' category` });
        }
        res.status(200).json(drinksInCategory);
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: 'Error fetching drinks by category', error: error.message });
    }
});

app.get('/api/drinks/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(__dirname, 'drinks.json');

    try {
        const myData = readJSONFile(filePath);
        const drink = myData.drinks.find(drink => drink.id === id);

        if (!drink) {
            return res.status(404).json({ message: 'Drink not found' });
        }
        res.status(200).json({ message: 'Drink found', drink });
    } catch (error) {
        console.error("Error retrieving drink by ID:", error);
        res.status(404).json({ message: "Error retrieving drink by ID", error: error.message });
    }
});

app.post('/api/drinks', (req, res) => {
    try {
        const validationError = validateDrinkFields(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;
        const newDrink = new Drink(name, category, ingredients, glass, alcoholContent, allergens);
        newDrink.id = uuidv4();

        const drinksManager = new DrinksManager();
        if (drinksManager.findDuplicate(newDrink)) {
            return res.status(400).json({ message: "Drink already exists in this category." });
        }

        drinksManager.addDrink(newDrink);
        res.status(201).json({ id: newDrink.id, message: "Drink added successfully!" });
    } catch (error) {
        console.error("Error adding drink:", error);
        res.status(500).json({ message: "Error adding drink", error: error.message });
    }
});

app.delete('/api/drinks/:id', (req, res) => {
    try {
        const id = req.params.id;

        const drinksManager = new DrinksManager();
        const removedDrink = drinksManager.removeDrink(id);

        if (!removedDrink) {
            return res.status(404).json({ message: "Drink not found" });
        }

        res.status(200).json({ id, message: "Drink removed successfully!" });
    } catch (error) {
        console.error("Error removing drink:", error);
        res.status(500).json({ message: "Error removing drink", error: error.message });
    }
});

app.put('/api/drinks/:id', (req, res) => {
    const id = req.params.id;

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
        const updatedDrink = drinksManager.updateDrink(id, updatedDrinkDetails);
        res.status(200).json({
            message: 'Drink updated successfully',
            drink: updatedDrink
        });
    } catch (error) {
        console.error("Error updating drink:", error);
        res.status(500).json({
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = { app, readJSONFile };
