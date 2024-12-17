import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Drink, DrinksManager, CategoryManager } from './drinkForm.js';
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


/* GET/ api / drinks
- Should perform these checks
      - Make sure there's drinks in the file
      - Make sure that the file is the drinks.json file
      - JSON parsing errors
*/
app.get('/api/drinks', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');

    try{
        const myData = JSON.parse(readFileSync(filePath, 'utf8'))
        if (!myData || !myData.drinks || myData.drinks.length === 0) {
            return res.status(404).json({ message: "No drinks found" });
        }
        res.json(myData)
    } catch (error){
        console.error(error);
        res.status(500).json({message: "Error reading drinks data"})
    }

    res.json([
        { name: 'Mojito', category: 'Cocktail', ingredients: ['mint', 'lime', 'rum'] },
        { name: 'Virgin Mojito', category: 'Mocktail', ingredients: ['mint', 'lime', 'soda'] },
    ]);
});

/* GET/ api / drinks/ id

- Should get list of specified drink in file
- Should perform these checks
       - Make sure that the ID exists
       - ID only contains numbers
       - JSON parsing error
       - JSON has unexpected structure
       - Allergen safety warning ?

 */

app.get('api/drinks/:category', (req,res) => {

    }





)




app.get('/api/drinks/:id', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
        const myData = readJSONFile(filePath);
        const drink = myData.drinks.find(drink => drink.id === id);

        if (!drink) {
            return res.status(404).json({message: 'Drink not found'});
        }

        if (drink.allergens.length > 0) {
            return res.status(200).json({ allergens: drink.allergens });
        } else {
            return res.status(200).json({ message: 'No allergens listed for this drink.' });
        }

    } catch (error) {
        console.error("Error retrieving drink by ID:", error)
        res.status(500).json({message: "Error retrieving drink by ID:", error})
    }
});

/* POST /api/drinks

- Should get list of specified drink in file
- Maybe bulk drinks should be created at the same time (other POST apis), if one is invalid post all except the one
- Should perform these checks :
      - Alcohol content doesn't exceed 100 DONE
      - None of the inputs can be empty DONE
      - Category can only be Cocktail, Mocktail or other DONE
      - Convert all characters in inputs into lowercase/uppercase automatically DONE
      - Duplicate drinks and ingredients
      - Alcohol is a double or int and nothing else
      - Bulk of invalid data in object
      - Unfinished request body with missing variables
      - Name, ingredients have limited number of characters
      - Body of object is too large , too many variables
      - All Cocktails should have more than 1 percent alcohol
      - All Mocktails should have 0 as alcohol content
      - Permission check ?
      - Limit on the amount of created drinks
 */

app.post('/api/drinks', (req , res) => {
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
    const newDrink = new Drink(name, category, ingredients, glass, alcoholContent);
    newDrink.id = uuidv4();
    try {
        const drinksManager = new DrinksManager();

        if (drinksManager.findDuplicate(newDrink)) {
            return res.status(400).json({ message: "Drink already exists in this category." });
        }

        drinksManager.addDrink(newDrink);
        res.status(200).json({ id: newDrink.id, message: "Drink added successfully!" });
    }

    catch (error) {
        console.error("Error adding drink:", error);
        res.status(500).json({ message: "Error adding drink", error: error.message });

    }


    });

/* DELETE/ api / drinks

- Should get delete of specified drink in file
- Maybe should include an api that deletes all drinks in the JSON file

- Make sure that the ID exists
- Make sure that it's valid ID (all numbers)
- Parse error
- Check if someone wants to delete the last drink in the file
- Permission check ?

 */

app.delete('/api/drinks/:id', (req , res) => {
        const id = req.params.id;

        try {
            const drinkManager = new DrinksManager()

            drinkManager.removeDrink(id)
            res.status(200).json({ id, message: "Drink removed successfully!" });


        } catch (error) {
            console.error("Error adding drink:", error);
            res.status(500).json({ message: "Error removing drink", error: error.message });

        }
    }


)


app.put('/api/drinks/:id', (req , res) => {
    const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
    const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

    if (drinkIndex === -1 ) {
        return res.status(404).json({message: 'Drink not found'});
    }

    if (!name || !category || !ingredients || !glass || !alcoholContent || !allergens) {
            return res.status(400).json({message: 'Missing required fields'});
    }

    if (!Array.isArray(ingredients) || ingredients.some(i => typeof i !== 'string')) {
            return res.status(400).json({ message: 'Ingredients must be an array of strings' });
        }

        fileData.drinks[drinkIndex] = { id, name, category, ingredients, glass, alcoholContent };
        writeFileSync(filePath, JSON.stringify(fileData), 'utf8');

        res.status(200).json({ message: 'Drink updated successfully', drinks: fileData.drinks });
    } catch(error){
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }

});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


















