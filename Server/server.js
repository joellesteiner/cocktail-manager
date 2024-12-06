// app.js
import express from 'express';
const app = express();
const port = 3000;

import path from 'path';
import DrinkManager from './drinkForm.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const drinkManager = new DrinkManager();

const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(express.json());

app.get('/api/drinks', (req, res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    console.log(filePath)

    const myData = JSON.parse(readFileSync(filePath, 'utf8'))

    res.json(myData)
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
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'));
    const { id } = req.body;
    const filteredDrinks = fileData.drinks.filter(drink => drink.id !== id);
    writeFileSync(filePath, JSON.stringify({ drinks: filteredDrinks }), 'utf8');
    res.status(200).json({ message: 'Drink deleted successfully', drinks: filteredDrinks });
})

app.put('/api/drinks/:id', (req , res) => {
    const filePath = path.join(__dirname, 'drinks.json');
    const fileData = JSON.parse(readFileSync(filePath, 'utf8'))
    const { id, name, category, ingredients, glass, alcoholContent } = req.body;
    const drinkIndex = fileData.drinks.findIndex(drink => drink.id === id);
    fileData.drinks[drinkIndex] = { id, name, category, ingredients, glass, alcoholContent };
    writeFileSync(filePath, JSON.stringify(fileData), 'utf8');

})
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


















