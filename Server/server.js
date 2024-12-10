import express from 'express';
const app = express();
const port = 3000;

import path from 'path';
import DrinkManager from './drinkForm.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path} Received request`);
    next();
});


app.get('/api/drinks', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    console.log(filePath)

    const myData = JSON.parse(readFileSync(filePath, 'utf8'))

    res.json(myData)
});

app.get('/api/drinks/:id', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;
    console.log(filePath)
    const myData = JSON.parse(readFileSync(filePath, 'utf8'));

    const filteredDrinks = myData.drinks.filter(drink => drink.id === id);

    if (filteredDrinks.length === 0 ) {
        return res.status(404).json({message: 'Drink not found'});
    }

    res.status(200).json(filteredDrinks[0])
});

app.post('/api/drinks', (req , res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
    const { name, category, ingredients, glass, alcoholContent } = req.body;
    const newDrink = {
        id: `${Date.now()}`, // Use timestamp as a unique ID
        name,
        category,
        ingredients,
        glass,
        alcoholContent
    };
    fileData.drinks.push(newDrink);
    writeFileSync(filePath, JSON.stringify(fileData), 'utf8');
    res.status(201).json(newDrink);
})

app.delete('/api/drinks/:id', (req , res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
        const fileData = JSON.parse(readFileSync(filePath, 'utf8'));
        const filteredDrinks = fileData.drinks.filter(drink => drink.id !== id);

        if (filteredDrinks.length === fileData.drinks.length) {
            return res.status(404).json({message: 'Drink not found'});
        }

        writeFileSync(filePath, JSON.stringify({drinks: filteredDrinks}), 'utf8');
        res.status(200).json({ message: 'Drink deleted successfully', drinks: filteredDrinks });
    } catch (error) {
        res.status(500).json({ message: ' Server error', error: error.message });
    }
})

app.put('/api/drinks/:id', (req , res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const id = req.params.id;

    try {
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
    const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);

    if (drinkIndex === -1 ) {
        return res.status(404).json({message: 'Drink not found'});
    }

    const {name, category, ingredients, glass, alcoholContent} = req.body;

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


















