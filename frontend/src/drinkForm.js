import path from "path";
import { readFileSync, writeFileSync } from "node:fs";

// Represents a single drink
export class Drink {
    constructor(name, category, ingredients, glass, alcoholContent = null, allergens = []) {
        // Validate category
        if (typeof category !== 'string') {
            throw new Error("Category must be a string");
        }
        this.name = name;
        this.category = category.trim().toLowerCase();
        this.ingredients = ingredients;
        this.glass = glass;
        this.alcoholContent = alcoholContent;
        this.allergens = allergens;

        // Validate allergens array
        if (!Array.isArray(allergens)) {
            throw new Error("Invalid allergens.");
        }

        // Valid categories check
        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(category)) {
            throw new Error("Invalid category. Please choose from cocktail, mocktail or other.");
        }

        // Validate other fields
        if (typeof this.name !== "string") throw new Error("Invalid name.");
        if (!Array.isArray(ingredients) || this.ingredients.length === 0) throw new Error("Invalid ingredients.");
        if (typeof this.alcoholContent !== "number" || this.alcoholContent < 0 || this.alcoholContent > 100) {
            throw new Error("Alcohol content must be a number between 0 - 100");
        }
    }
}

// Manages drink categories and operations related to them
export class CategoryManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.categories = {
            mocktail: [],
            cocktail: [],
            other: [],
        };
        this.loadDrinksFromFile();
    }

    // Load drinks from the file and categorize them
    loadDrinksFromFile() {
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            fileData.drinks.forEach(drink => {
                const category = drink.category?.trim().toLowerCase();
                if (this.categories[category]) {
                    this.categories[category].push(drink);
                }
            });
        } catch (error) {
            throw new Error("Error loading drinks into categories: " + error.message);
        }
    }

    // Assign a drink to a category with duplication check
    assignDrinkToCategory(drink, category) {
        const normalCategory = category.trim().toLowerCase();
        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(normalCategory)) {
            throw new Error("Invalid category. Please choose from cocktail, mocktail, or other.");
        }

        const duplicateDrink = this.categories[normalCategory].some(existingDrink =>
            existingDrink.name === drink.name &&
            existingDrink.ingredients.join(",") === drink.ingredients.join(",")
        );

        if (duplicateDrink) {
            throw new Error("Drink already exists in this category.");
        }
        this.categories[normalCategory].push(drink);
    }

    // Retrieve drinks by category
    getDrinksByCategory(category) {
        const normalCategory = category.trim().toLowerCase();
        if (!this.categories.hasOwnProperty(normalCategory)) {
            throw new Error("Invalid Category");
        }
        return this.categories[normalCategory];
    }

    // Remove a drink from a category
    removeDrinkFromCategory(id, category) {
        const normalCategory = category.trim().toLowerCase();
        const categoryDrinks = this.categories[normalCategory];

        if (categoryDrinks) {
            this.categories[normalCategory] = categoryDrinks.filter(drink => drink.id !== id);
        }
    }
}

// Manages all drink-related operations including adding, removing, and updating drinks
export class DrinksManager {

    constructor() {
        // Check for environment variable or default to local file
        this.filePath = process.env.DRINK_JSON_PATH ? process.env.DRINK_JSON_PATH : path.join(__dirname, "drinks.json");
        this.CategoryManager = new CategoryManager(this.filePath);
    }

    // Retrieve all drinks from the file
    getAllDrinks() {
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            return fileData.drinks || [];
        } catch (error) {
            throw new Error('Error retrieving the drinks list: ' + error.message);
        }
    }

    // Remove a drink by ID and update the file
    removeDrink(id) {
        const writeJSONFile = (filePath, data) => {
            try {
                writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            } catch (error) {
                throw new Error("Error writing data to JSON file: " + error.message);
            }
        };

        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

            if (drinkIndex === -1) {
                return null;
            }

            const drinkCategory = fileData.drinks[drinkIndex].category;
            const removedDrink = fileData.drinks.splice(drinkIndex, 1)[0];

            this.CategoryManager.removeDrinkFromCategory(id, drinkCategory);

            writeJSONFile(this.filePath, { drinks: fileData.drinks });
            return removedDrink;
        } catch (error) {
            throw new Error('Error removing the drink: ' + error.message);
        }
    }

    // Add a new drink to the file
    addDrink(newDrink) {
        const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
        if (this.findDuplicate(newDrink)) {
            throw new Error('Drink already exists in this category.');
        }
        fileData.drinks.push(newDrink);
        writeFileSync(this.filePath, JSON.stringify(fileData, null, 2), 'utf8');
        this.CategoryManager.assignDrinkToCategory(newDrink, newDrink.category);
    }

    // Update an existing drink by ID
    updateDrink(id, updatedDrinkDetails) {
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

            if (drinkIndex === -1) {
                throw new Error("Drink not found.");
            }

            const existingDrink = fileData.drinks[drinkIndex];

            if (this.findDuplicate(updatedDrinkDetails, id)) {
                throw new Error('A drink with this name already exists in the same category.');
            }

            const updatedDrink = {
                ...existingDrink,
                ...updatedDrinkDetails,
            };

            this.validateDrinkFields(updatedDrink);

            if (existingDrink.category !== updatedDrink.category) {
                this.CategoryManager.removeDrinkFromCategory(id, existingDrink.category);
                this.CategoryManager.assignDrinkToCategory(updatedDrink, updatedDrink.category);
            }

            fileData.drinks[drinkIndex] = updatedDrink;

            writeFileSync(this.filePath, JSON.stringify(fileData, null, 2), 'utf8');

            return updatedDrink;
        } catch (error) {
            throw new Error("Error updating the drink: " + error.message);
        }
    }

    // Validate the fields for a drink
    validateDrinkFields(drink) {
        const { name, category, ingredients, alcoholContent } = drink;

        if (!name || typeof name !== 'string') {
            throw new Error('Invalid name: Name must be a non-empty string.');
        }

        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(category.toLowerCase())) {
            throw new Error('Invalid category: Please choose from "cocktail", "mocktail", or "other".');
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0 || ingredients.some(i => typeof i !== 'string')) {
            throw new Error('Invalid ingredients: Ingredients must be a non-empty array of strings.');
        }

        if (typeof alcoholContent !== 'number' || alcoholContent < 0 || alcoholContent > 100) {
            throw new Error('Invalid alcohol content: Must be a number between 0 and 100.');
        }
    }

    // Check for duplicate drink by name and category
    findDuplicate(updatedDrink, idToExclude = null) {
        return this.getAllDrinks().some(existingDrink =>
            existingDrink.name === updatedDrink.name &&
            existingDrink.category === updatedDrink.category &&
            existingDrink.id !== idToExclude
        );
    }
}





