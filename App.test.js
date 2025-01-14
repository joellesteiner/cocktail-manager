/* eslint-env jest */
const fs = require('fs');
const request = require('supertest');
const express = require('express');
const os = require('os');
const path = require('path');

const { app } = require('./server.js')
app.use(express.json());

function temporaryJSONfile() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drinks-temp-'));
    const tempFilePath = path.join(tempDir, 'drinks.json');
    fs.writeFileSync(tempFilePath,'{ "drinks": [] }', 'utf8');
    process.env.DRINK_JSON_PATH = tempFilePath;
}
temporaryJSONfile();

console.log(`Environment variable DRINK_JSON_PATH set to: ${process.env.DRINK_JSON_PATH}`);

    describe('GET /api/drinks/:id (Edge Cases)', () => {
        it('should post a drink and return all drinks using the GET /api/drinks API', async () => {
            const testDrink = {
                name: 'My Test Drink',
                category: 'other',
                ingredients: ['Test Ingredients'],
                glass: 'none',
                alcoholContent: 0,
                allergens: ['none'],
            };

            const postResponse = await request(app)
                .post('/api/drinks')
                .send(testDrink)
                .expect(201);

            expect(postResponse.body).toBeDefined();
            expect(postResponse.body).toHaveProperty('message', 'Drink added successfully!');
            expect(postResponse.body).toHaveProperty('id'); // Ensure an ID is returned

            const getResponse = await request(app).get('/api/drinks').expect(200);

            expect(getResponse.body).toBeDefined();
            expect(getResponse.body).toHaveProperty('message', 'Drinks list retrieved successfully');
            expect(getResponse.body).toHaveProperty('drinks');
            expect(Array.isArray(getResponse.body.drinks)).toBe(true);

            const foundDrink = getResponse.body.drinks.find((drink) => drink.name === 'My Test Drink');
            expect(foundDrink).toBeDefined();
            expect(foundDrink).toMatchObject({
                name: 'My Test Drink',
                category: 'other',
                ingredients: ['Test Ingredients'],
                glass: 'none',
                alcoholContent: 0,
                allergens: ['none'],
            });


        it('should return an error message when no drinks are available', async () => {
            const getResponse = await request(app).get('/api/drinks');
            if (getResponse.body.drinks && getResponse.body.drinks.length > 0) {
                for (const drink of getResponse.body.drinks) {
                    await request(app).delete(`/api/drinks/${drink.id}`).expect(200);
                }
            }

            const emptyGetResponse = await request(app).get('/api/drinks');

            expect(emptyGetResponse.status).toBe(404); // The status should be 404 for "not found"
            expect(emptyGetResponse.body).toHaveProperty('message', 'No drinks available'); // Proper error message
        });


        it('should return 404 if the drink ID format is invalid', async () => {
            const invalidId = 'invalid-id-format';

            const response = await request(app).get(`/api/drinks/${invalidId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });
    });


    describe('POST /api/drinks (Edge Cases)', () => {
        it('should return 400 if no data is provided in the POST request', async () => {
            const response = await request(app).post('/api/drinks').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "Missing required fields");
        });

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

        it('should return 500 if required fields are missing', async () => {
            const invalidDrink = {
                name: 'Mocktail Without Ingredients',
                category: 'mocktail',
                ingredients: [],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            };

            const response = await request(app).post('/api/drinks').send(invalidDrink);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error adding drink');
        });

        it('should successfully post a new drink', async () => {
            const testDrink = {
                name: 'Test Drink',
                category: 'mocktail',
                ingredients: ['Test Ingredient 1', 'Test Ingredient 2'],
                glass: 'highball',
                alcoholContent: 0,
                allergens: ['none'],
            };

            const response = await request(app)
                .post('/api/drinks')
                .send(testDrink)
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body).toHaveProperty('message', 'Drink added successfully!');
            expect(response.body).toHaveProperty('id');
        });


});

    describe('DELETE /api/drinks/:id (Edge Cases)', () => {
        it('should return 404 for a non-existent or invalid drink ID', async () => {
            const invalidId = 'invalid-id';

            const response = await request(app).delete(`/api/drinks/${invalidId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });

        it('should return 404 if the drink ID does not exist for deletion', async () => {
            const response = await request(app).delete('/api/drinks/non-existing-id');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });

    describe('PUT /api/drinks/:id (Edge Cases)', () => {
        it('should return 500 if the drink does not exist for updating', async () => {
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

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
        });

        it('should return 500 for invalid drink ID format', async () => {
            const response = await request(app).put('/api/drinks/invalid-id').send({
                name: 'New Drink',
                category: 'mocktail',
                ingredients: ['water', 'sugar'],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
        });

        it('should return 500 if the drink ID does not exist for update', async () => {
            const response = await request(app).put('/api/drinks/non-existing-id').send({
                name: 'New Drink',
                category: 'mocktail',
                ingredients: ['water', 'sugar'],
                glass: 'Glass',
                alcoholContent: 0,
                allergens: [],
            });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
        });


        it('should return 500 if required fields are missing', async () => {
            const drinkId = 'Id'
            const invalidData = {
                name: '',
                category: 'cocktail',
                ingredients: ['tequila', 'lime juice'],
                glass: 'Cocktail Glass',
                alcoholContent: 40,
                allergens: ['citrus'],
            };

            const response = await request(app).put(`/api/drinks/${drinkId}`).send(invalidData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', "Error updating the drink: Drink not found.");
        });
        it('should post a drink and update it using the PUT /api/drinks/:id API', async () => {
            const testDrink = {
                name: 'Original Drink',
                category: 'mocktail',
                ingredients: ['Original Ingredients'],
                glass: 'highball',
                alcoholContent: 0,
                allergens: ['none'],
            };

            const postResponse = await request(app)
                .post('/api/drinks')
                .send(testDrink)
                .expect(201);

            const drinkId = postResponse.body.id;

            expect(postResponse.body).toBeDefined();
            expect(postResponse.body).toHaveProperty('id');

            const updatedDrink = {
                name: 'Updated Drink',
                category: 'cocktail',
                ingredients: ['Updated Ingredients'],
                glass: 'cocktail glass',
                alcoholContent: 10,
                allergens: ['nuts'],
            };

            const putResponse = await request(app)
                .put(`/api/drinks/${drinkId}`)
                .send(updatedDrink)
                .expect(200);

            expect(putResponse.body).toBeDefined();
            expect(putResponse.body).toHaveProperty('message', 'Drink updated successfully');
            expect(putResponse.body.drink).toBeDefined();
            expect(putResponse.body.drink).toHaveProperty('id', drinkId);
            expect(putResponse.body.drink).toMatchObject(updatedDrink);

            const getResponse = await request(app)
                .get(`/api/drinks/${drinkId}`)
                .expect(200);

            expect(getResponse.body).toBeDefined();
            expect(getResponse.body).toHaveProperty('message', 'Drink found');
            expect(getResponse.body.drink).toBeDefined();
            expect(getResponse.body.drink).toHaveProperty('id', drinkId);
            expect(getResponse.body.drink).toMatchObject(updatedDrink);
        });


    });
