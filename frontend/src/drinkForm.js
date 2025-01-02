import path from "path";
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Drink {

    constructor(name, category, ingredients, glass, alcoholContent = null, allergens = []) {
        this.name = name.trim().toLowerCase();
        if (typeof category !== 'string') {
            throw new Error("Category must be a string");
        }
        this.category = category.trim().toLowerCase();
        this.ingredients = ingredients;
        this.glass = glass;
        this.alcoholContent = alcoholContent;
        this.allergens = allergens;

        if (!Array.isArray(allergens)) {
            throw new Error("Invalid allergens.");
        }

        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(category)) {
            throw new Error("Invalid category.Please choose from cocktail, mocktail or other.")
        }

        if (typeof this.name !== "string") {
            throw new Error("Invalid name.")
        }

        if (!Array.isArray(ingredients) || this.ingredients.length === 0) {
            throw new Error("Invalid ingredients.");
        }

        if (typeof this.alcoholContent !== "number" || this.alcoholContent < 0 || this.alcoholContent > 100) {
            throw new Error("Invalid, Alcohol content must be a number between 0 - 100");
        }

    }

}

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

    loadDrinksFromFile() {
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            fileData.drinks.forEach(drink => {
                const category = drink.category?.trim().toLowerCase();
                if (this.categories[category]) {
                    this.categories[category].push(drink); // Assign to the appropriate category.
                }
            });
        } catch (error) {
            throw new Error("Error loading drinks into categories: " + error.message);
        }
    }

    assignDrinkToCategory(drink, category) {
        const normalCategory = category.trim().toLowerCase()

        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(normalCategory)) {
            throw new Error("Invalid category. Please choose from cocktail, mocktail, or other.");
        }
        const categoryDrinks = this.categories[normalCategory];
        const duplicateDrink = categoryDrinks.some(existingDrink =>
            existingDrink.name === drink.name &&
            existingDrink.ingredients.join(",") === drink.ingredients.join(",")
        );
        if (duplicateDrink) {
            throw new Error("Drink already exists in this category.");
        }
        this.categories[normalCategory].push(drink);
    }

    getDrinksByCategory(category) {
        const normalCategory = category.trim().toLowerCase()
        if (!this.categories.hasOwnProperty(normalCategory)) {
            throw new Error("Invalid Category");
        }
        return this.categories[normalCategory]
    }

    removeDrinkFromCategory(id, category) {
        const normalCategory = category.trim().toLowerCase()
        const categoryDrinks = this.categories[normalCategory];

        if (categoryDrinks) {
            this.categories[normalCategory] = categoryDrinks.filter(drink => drink.id !== id);
        }

    }

}

export class DrinksManager {
    constructor() {

        this.filePath = path.join(__dirname, "drinks.json");
        this.CategoryManager = new CategoryManager(this.filePath);

    }

    getFilePath() {
        return this.filePath
    }

    getAllDrinks() {
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
            return fileData.drinks || [];
        } catch (error) {
            throw new Error('Error retrieving the drinks list: ' + error.message);
        }
    }

    removeDrink(id) {

        const writeJSONFile = (filePath, data) => {
            try {
                writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            } catch (error) {
                throw new Error("Error writing data to JSON file: " + error.message);
            }
        }
        try {
            const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'))
            const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

            if (drinkIndex === -1) {
                return null;
            }
            const drinkCategory = fileData.drinks[drinkIndex].category;
            const removedDrink = fileData.drinks.splice(drinkIndex, 1)[0];
            this.CategoryManager.removeDrinkFromCategory(id, drinkCategory);
            writeJSONFile(this.filePath, {drinks: fileData.drinks});
            return removedDrink;
        } catch (error) {
            throw new Error('Error removing the drink: ' + error.message);

        }

    }

    addDrink(newDrink) {
        const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'));
        if (this.findDuplicate(newDrink)) {
            throw new Error('Drink already exists in this category.');
        }
        fileData.drinks.push(newDrink);
        writeFileSync(this.filePath, JSON.stringify(fileData, null, 2), 'utf8');
        this.CategoryManager.assignDrinkToCategory(newDrink, newDrink.category);
    }

    findDuplicate(drink) {
        return this.getAllDrinks().some(existingDrink =>
            existingDrink.name === drink.name &&
            existingDrink.category === drink.category
        );
    };

}

