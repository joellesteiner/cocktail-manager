/* eslint-env jest */
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

const mockDrinks = [
    {
        id: 'test-id-123',
        name: 'Margarita',
        category: 'cocktail',
        ingredients: ['tequila', 'lime juice', 'triple sec'],
        glass: 'Cocktail Glass',
        alcoholContent: 40,
        allergens: ['citrus'],
    },
    {
        id: 'test-id-456',
        name: 'Virgin Mojito',
        category: 'mocktail',
        ingredients: ['mint', 'lime', 'sugar', 'sparkling water'],
        glass: 'Highball Glass',
        alcoholContent: 0,
        allergens: [],
    },
];
describe('GET /api/drinks/:id (Edge Cases)', () => {
    it('should return 404 if the drink ID format is invalid', async () => {
        const invalidId = 'invalid-id-format';

        const response = await request(app).get(`/api/drinks/${invalidId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Drink not found');
    });
});


app.get('/api/drinks', (req, res) => {
    if (mockDrinks.length === 0) {
        return res.status(404).json({ message: 'No drinks available' });
    }
    res.status(200).json({
        message: 'Drinks list retrieved successfully',
        drinks: mockDrinks,
    });
});

app.get('/api/drinks/:id', (req, res) => {
    const drink = mockDrinks.find(d => d.id === req.params.id);
    if (!drink) {
        return res.status(404).json({ message: 'Drink not found' });
    }
    res.status(200).json({ message: 'Drink found', drink });
});


    it('should return 404 if drink ID does not exist', async () => {
        const response = await request(app).get('/api/drinks/non-existing-id');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Drink not found');
});



app.post('/api/drinks', (req, res) => {
    const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: 'Ingredients must be an array of strings' });
    }

    if (!name || !category || !glass) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newDrink = { id: `mock-${Date.now()}`, ...req.body };
    mockDrinks.push(newDrink);
    res.status(201).json({ message: 'Drink added successfully!', id: newDrink.id });
});

describe('POST /api/drinks (Missing Required Fields)', () => {
    it('should return 400 if required fields are missing', async () => {
        const invalidDrink = {
            ingredients: ['mint', 'sugar'],
            alcoholContent: 0,
            allergens: [],
        };

        const response = await request(app).post('/api/drinks').send(invalidDrink);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Missing required fields');
    });
});


describe('DELETE /api/drinks/:id (Edge Cases)', () => {
    it('should return 404 for a non-existent or invalid drink ID', async () => {
        const invalidId = 'invalid-id';

        const response = await request(app).delete(`/api/drinks/${invalidId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Drink not found');
    });
});


app.delete('/api/drinks/:id', (req, res) => {
    const index = mockDrinks.findIndex((d) => d.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Drink not found' });
    }
    const removedDrink = mockDrinks.splice(index, 1);
    res.status(200).json({ message: 'Drink removed successfully!', id: removedDrink[0].id });
});

app.put('/api/drinks/:id', (req, res) => {
    const drinkIndex = mockDrinks.findIndex(d => d.id === req.params.id);
    if (drinkIndex === -1) {
        return res.status(404).json({ message: 'Drink not found' });
    }

    const { name, category, ingredients, glass, alcoholContent, allergens } = req.body;

    if (!name || !category || !ingredients || !glass || alcoholContent === undefined || allergens === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedDrink = { ...mockDrinks[drinkIndex], ...req.body };
    mockDrinks[drinkIndex] = updatedDrink;
    res.status(200).json({ message: 'Drink updated successfully', drink: updatedDrink });
});

app.use(express.json());

describe('Drink Manager API (with mock data)', () => {
    describe('GET /api/drinks', () => {
        it('should retrieve all drinks successfully', async () => {
            const response = await request(app).get('/api/drinks');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Drinks list retrieved successfully');
            expect(Array.isArray(response.body.drinks)).toBe(true);
            expect(response.body.drinks).toHaveLength(mockDrinks.length);
        });

        it('should return 404 if no drinks are available', async () => {
            mockDrinks.length = 0; // Clear mock data for this test
            const response = await request(app).get('/api/drinks');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'No drinks available');
        });
    });

    describe('GET /api/drinks (No Drinks in DB)', () => {
        it('should return 404 if no drinks are available', async () => {
            mockDrinks.length = 0; // Clear mock data for this test
            const response = await request(app).get('/api/drinks');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'No drinks available');
        });
    });


    describe('POST /api/drinks', () => {
        it('should add a new drink successfully', async () => {
            const newDrink = {
                name: 'Mocktail',
                category: 'mocktail',
                ingredients: ['water', 'sugar'],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            };

            const response = await request(app).post('/api/drinks').send(newDrink);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Drink added successfully!');
            expect(response.body).toHaveProperty('id');
            expect(mockDrinks).toHaveLength(1); // Verify mock data updated
        });
    });


    describe('POST /api/drinks (Invalid data)', () => {
        it('should return 400 if required fields are missing', async () => {
            const invalidDrink = {
                name: 'Mocktail Without Ingredients',
                category: 'mocktail',
                ingredients: [],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            };

            const response = await request(app).post('/api/drinks').send(invalidDrink);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Ingredients must be an array of strings');
        });
    });

    describe('POST /api/drinks (Edge Cases)', () => {
        it('should return 400 if no data is provided in the POST request', async () => {
            const response = await request(app).post('/api/drinks').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message',  "Ingredients must be an array of strings");
        });
    });


    describe('PUT /api/drinks/:id', () => {
        it('should update a drink by its ID', async () => {
            const drinkId = mockDrinks[0].id;
            const updatedData = {
                name: 'Updated Margarita',
                category: 'cocktail',
                ingredients: ['tequila', 'lime juice', 'triple sec', 'salt'],
                glass: 'Cocktail Glass',
                alcoholContent: 45,
                allergens: ['citrus'],
            };

            const response = await request(app).put(`/api/drinks/${drinkId}`).send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Drink updated successfully');
            expect(response.body.drink.name).toBe(updatedData.name);
            expect(response.body.drink.ingredients).toEqual(updatedData.ingredients);
        });

        describe('PUT /api/drinks/:id (Invalid ID)', () => {
            it('should return 404 for invalid drink ID format', async () => {
                const response = await request(app).put('/api/drinks/invalid-id').send({
                    name: 'New Drink',
                    category: 'mocktail',
                    ingredients: ['water', 'sugar'],
                    glass: 'Glass',
                    alcoholContent: 0,
                    allergens: [],
                });

                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('message', 'Drink not found');
            });
        });



        it('should return 404 if the drink ID does not exist for update', async () => {
            const response = await request(app).put('/api/drinks/non-existing-id').send({
                name: 'New Drink',
                category: 'mocktail',
                ingredients: ['water', 'sugar'],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });

    describe('PUT /api/drinks/:id (Invalid data)', () => {
        it('should return 400 if required fields are missing', async () => {
            const drinkId = mockDrinks[0].id;
            const invalidData = {
                name: '',
                category: 'cocktail',
                ingredients: ['tequila', 'lime juice'],
                glass: 'Cocktail Glass',
                alcoholContent: 40,
                allergens: ['citrus'],
            };

            const response = await request(app).put(`/api/drinks/${drinkId}`).send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Missing required fields');
        });
    });

    describe('PUT /api/drinks/:id (Edge Cases)', () => {
        it('should return 404 if the drink does not exist for updating', async () => {
            const invalidId = 'nonexistent-id';

            const updatedDrink = {
                name: 'Updated Drink',
                category: 'cocktail',
                ingredients: ['vodka', 'orange juice'],
                glass: 'Cocktail Glass',
                alcoholContent: 40,
                allergens: ['citrus'],
            };

            const response = await request(app).put(`/api/drinks/${invalidId}`).send(updatedDrink);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });


    describe('DELETE /api/drinks/:id', () => {
        it('should delete a drink by its ID', async () => {
            const drinkId = mockDrinks[0].id;

            const response = await request(app).delete(`/api/drinks/${drinkId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Drink removed successfully!');

            // Ensure the drink is actually removed
            const getResponse = await request(app).get(`/api/drinks/${drinkId}`);
            expect(getResponse.status).toBe(404);  // The deleted drink should no longer be found
        });

        it('should return 404 if the drink ID does not exist for deletion', async () => {
            const response = await request(app).delete('/api/drinks/non-existing-id');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });


});
