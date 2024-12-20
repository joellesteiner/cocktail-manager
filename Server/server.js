import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Drink, CategoryManager, DrinksManager } from './drinkForm.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path} Received request`);
    next();
});
const readJSONFile = (filePath) => {
    try {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error("Error reading or parsing JSON data");
    }
};

app.get('/api/drinks', (req, res) => {
    try {
        const DrinkManager = new DrinksManager()
        const drinks = DrinkManager.getAllDrinks();

        if (drinks.length === 0) {
            return res.status(404).json({message: 'No drinks available'});
        }
        res.status(200).json({
            message: 'Drinks list retrieved successfully',
            drinks: drinks
        });
        } catch (error) {
        console.error("Error fetching drinks:", error);
        res.status(500).json({
            message: 'Error fetching drinks',
            error: error.message

        });
    }
});




app.get('/api/drinks/category/:category', (req, res) => {

    try {
        const category = req.params.category.trim().toLowerCase();

        const categoryManager = new CategoryManager(path.join(__dirname, 'drinks.json'));
        const drinksInCategory = categoryManager.getDrinksByCategory(category);

        if (drinksInCategory.length === 0) {
            return res.status(404).json({message: `No drinks found in the '${category}' category`});
        }
        res.status(200).json(drinksInCategory);
    } catch (error) {
        console.error("Error retrieving drinks by category:", error);
        res.status(500).json({message: "Error retrieving drinks by category", error: error.message});
    }
});
        app.get('/api/drinks/:id', (req, res) => {
            const id = req.params.id;
            const filePath = path.join(__dirname, 'drinks.json');

            try {
                const myData = readJSONFile(filePath);
                const drink = myData.drinks.find(drink => drink.id === id);

                if (!drink) {
                    return res.status(404).json({message: 'Drink not found'});
                }
                res.status(200).json({ message: 'Drink found', drink: drink });


            } catch (error) {
                console.error("Error retrieving drink by ID:", error)
                res.status(500).json({message: "Error retrieving drink by ID:", error})
            }
        });

        app.post('/api/drinks', (req, res) => {
            try {
                app.use(express.json());
                const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;

                if (!name || !category || !ingredients || !glass || alcoholContent === undefined || allergens === undefined) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }

                if (!Array.isArray(ingredients) || ingredients.some(i => typeof i !== 'string')) {
                    return res.status(400).json({ message: 'Ingredients must be an array of strings' });
                }

                const validCategories = ["cocktail", "mocktail", "other"];
                if (!validCategories.includes(category.toLowerCase())) {
                    return res.status(400).json({ message: 'Invalid category. Please choose from cocktail, mocktail, or other.' });
                }

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
                const id = req.params.id;

                try {
                    const drinkManager = new DrinksManager()

                    drinkManager.removeDrink(id)
                    res.status(200).json({id, message: "Drink removed successfully!"});


                } catch (error) {
                    console.error("Error adding drink:", error);
                    res.status(500).json({message: "Error removing drink", error: error.message});

                }
            }
        )


        app.put('/api/drinks/:id', (req, res) => {
            const {name, category, ingredients, glass, alcoholContent, allergens} = req.body;
            const filePath = path.join(__dirname, 'drinks.json');
            const id = req.params.id;

            try {
                const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
                const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

                if (drinkIndex === -1) {
                    return res.status(404).json({message: 'Drink not found'});
                }

                if (!name || !category || !ingredients || !glass || !alcoholContent || !allergens) {
                    return res.status(400).json({message: 'Missing required fields'});
                }

                if (!Array.isArray(ingredients) || ingredients.some(i => typeof i !== 'string')) {
                    return res.status(400).json({message: 'Ingredients must be an array of strings'});
                }

                fileData.drinks[drinkIndex] = {id, name, category, ingredients, glass, alcoholContent};
                writeFileSync(filePath, JSON.stringify(fileData), 'utf8');

                res.status(200).json({message: 'Drink updated successfully', drinks: fileData.drinks});
            } catch (error) {
                res.status(500).json({message: 'Internal server error', error: error.message});
            }

        });




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

