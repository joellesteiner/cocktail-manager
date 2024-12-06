// Drink Class
class Drink{
    constructor(name, category, ingredients, glass, alcoholContent = null) {
        this.name = name;
        this.category = category;
        this.ingredients = ingredients;
        this.glass = glass;
        this.alcoholContent = alcoholContent;

    }
}

new Drink("Mojito", "cocktail", ["mint", "rum", "soda water", "lime"], "glass", 12);

// DrinkManager Class
class DrinkManager{
    constructor() {
        this.drinks = [] // An empty array to store drink objects
    }

// Add a new drink
    addDrink(drink){
        this.drinks.push(drink)
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
const mojito = new Drink("Mojito", "Cocktail", ["Rum", "Mint","Sugar"], "Mix all ingredients.", "Highball glass", 15.0
);

const manager = new DrinkManager(); // Create a manager


manager.addDrink(mojito);
console.log(manager.listDrinks());

