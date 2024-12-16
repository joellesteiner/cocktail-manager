import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Drink, DrinksManager } from './drinkForm.js';
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

const writeJSONFile = (filePath, data) => {
    try {
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        throw new Error("Error writing data to JSON file");
    }
};


/* GEcd/ api / drinks
- Should perform these checks
      - Make sure there's drinks in the file
      - Make sure that the file is the drinks.json file
      - JSON parsing errors
*/
app.get('/api/drinks', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    try{
        const myData = JSON.parse(readFileSync(filePath, 'utf8'))
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

app.get('/api/drinks/:id', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
        const myData = readJSONFile(filePath);
        const drink = myData.drinks.find(drink => drink.id === id);

        if (!drink) {
            return res.status(404).json({message: 'Drink not found'});
        }

        res.status(200).json(filteredDrinks[0])
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

const drinksManager = new DrinksManager();

app.post('/api/drinks', (req , res) => {
    try {
        const drink = new Drink (req.body.name , req.body.category, req.body.ingredients, req.body.glass, req.body.alcoholContent)
        drink.id = uuidv4();

        drinksManager.addDrink(drink)
        res.status(200).json({ id: drink.id, message: "Drink added successfully!" });
    } catch (error) {
        console.error("Error adding drink:", error);
        res.status(400).json({ message: error.message });

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
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
        const fileData = JSON.parse(readFileSync(filePath, 'utf8'));
        const filteredDrinks = fileData.drinks.filter(drink => drink.id !== id);

        if (filteredDrinks.length === fileData.drinks.length) {
            return res.status(404).json({message: 'Drink not found'});
        }

        writeJSONFile(filePath, { drinks: updatedDrinks });
        res.status(200).json({ message: 'Drink deleted successfully', drinks: filteredDrinks });
    } catch (error) {
        res.status(500).json({ message: ' Server error', error: error.message });
    }
})

/* PUT/ api / drinks

- Should be able to edit drinks in a file
- Maybe should include an api bulk edits based on id & category selection, if one is invalid change all except the one

- Make sure that the ID exists or isn't missing
- What happens when there is an empty request body ?
- Invalid or missing fields
- Ingredients has to be an array of strings , so there needs to be a check for this
- Alcohol content can't exceed 100
- Inputs for the other fields must be valid in terms of value type
- Must not allow duplicate ingredients
- Converts all string input into lowercase
- All Cocktails should have more than 1 percent alcohol
- All Mocktails should have 0 as alcohol content
- Request body is too large
- Permission check ?
- Allergen safety warning ?

 */

app.put('/api/drinks/:id', (req , res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
    const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

    if (drinkIndex === -1 ) {
        return res.status(404).json({message: 'Drink not found'});
    }

    if (!name || !category || !ingredients || !glass || !alcoholContent) {
            return res.status(400).json({message: 'Missing required fields'});
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


















