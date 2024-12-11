import path from "path";
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));


export class Drink {

    constructor(name, category, ingredients, glass, alcoholContent = null) {
        this.name = name.trim().toLowerCase();
        if (typeof category !== 'string') {
            throw new Error("Category must be a string");
        }
        this.category = category.trim().toLowerCase();
        this.ingredients = ingredients;
        this.glass = glass;
        this.alcoholContent = alcoholContent;

        const validCategories = ["cocktail", "mocktail", "other"];
        if (!validCategories.includes(category)) {
            throw new Error("Invalid category.Please choose from cocktail, mocktail or other.")
        }

        if(typeof this.name !== "string") {
            throw new Error("Invalid name.")
        }

        if(!Array.isArray(ingredients) || this.ingredients.length === 0) {
            throw new Error("Invalid ingredients.");
        }

        if (typeof this.alcoholContent !== "number" || this.alcoholContent < 0 || this.alcoholContent > 100){
            throw new Error("Invalid, Alcohol content must be a number between 0 - 100");
        }

    }

}

// DrinkManager Class
export class DrinksManager{
    constructor() {

    this.filePath = path.join(__dirname, "drinks.json");

}
    addDrink(Drink){

        const fileData = JSON.parse(readFileSync(this.filePath, 'utf8'))
        fileData.drinks.push(Drink);
        writeFileSync(this.filePath, JSON.stringify(fileData), 'utf8');

    }

    // Remove a drink by name
    removeDrink(name) {
        this.drinks = this.drinks.filter(drink => drink.name !== name);
    }

    editDrink(name, updatedDrink) {
        const index = this.drinks.findIndex(drink => drink.name === name);
        if (index !== -1) this.drinks[index] = updatedDrink;
    }

    filterByCategory(category) {
        return this.drinks.filter(drink => drink.category === category);
    }

    listDrinks() {
        return this.drinks; //Returns the entire array of drinks
    }


}

