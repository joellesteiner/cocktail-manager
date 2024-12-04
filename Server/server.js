// app.js
import express from 'express';
const app = express();
const port = 3001;

import path from 'path';

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
    fileData.drinks.push(req.body);
    writeFileSync(filePath, JSON.stringify(fileData), 'utf8');
    res.status(201).json(fileData);
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


















