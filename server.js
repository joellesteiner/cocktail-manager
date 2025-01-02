import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Drink, CategoryManager, DrinksManager } from './frontend/src/drinkForm.js';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const port = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3006' ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));

app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path} Received request`);
    next();
});

const readJSONFile = (filePath) => {
    try {
        const data = readFileSync(filePath, 'utf8');
        if (!data) {
            console.warn('File is empty, initialising w/ default structure.');
            return { drinks: [] };
        }
        console.log(data)
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error.message);
        console.warn('Reinitializing file with default structure.');
        return { drinks: [] };
    }
};

const writeJSONFile = (filePath, data) => {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        throw new Error("Error writing to JSON file");
    }
};

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
        res.status(500).json({ message: "Error retrieving drink by ID", error: error.message });
    }
});

app.post('/api/drinks', (req, res) => {
    console.log('[POST] /api/drinks - Request Body:', req.body);
    try {
        const validationError = validateDrinkFields(req.body);
        if (validationError) {
            console.error('Validation Error:', validationError);
            return res.status(400).json({ message: validationError });
        }

        const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;
        const newDrink = new Drink(name, category, ingredients, glass, alcoholContent, allergens);
        newDrink.id = uuidv4();

        const drinksManager = new DrinksManager();
        if (drinksManager.findDuplicate(newDrink)) {
            console.error('Duplicate Drink Error');
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
        console.log(`Deleting drink with ID: ${id}`);

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
    console.log('Updating drink with ID:', id);
    const drinksManager = new DrinksManager();
    const fileData = drinksManager.getAllDrinks();
    console.log(fileData)
    try {
        const drinkIndex = fileData.findIndex(drink => drink.id === id);

        console.log('File data:', fileData);
        console.log('Drink index:', drinkIndex);

        const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;
        fileData[drinkIndex] = {
            ...fileData[drinkIndex],
            name,
            category,
            ingredients,
            glass,
            alcoholContent,
            allergens
        };

        if (drinkIndex === -1) {
            return res.status(404).json({ message: 'Drink not found' });
        }
        const validationError = validateDrinkFields(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }


        writeJSONFile(drinksManager.getFilePath(), fileData);
        res.status(200).json({ message: 'Drink updated successfully', drink: fileData.drinks[drinkIndex] });

    } catch (error) {
        console.error("Error updating drink:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
