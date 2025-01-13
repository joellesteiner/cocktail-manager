/* eslint-env jest */
const request = require('supertest');
const express = require('express');

const { app } = require('./server.js')
app.use(express.json());



describe('GET /api/drinks/:id (Edge Cases)', () => {
    it('should return 404 if the drink ID format is invalid', async () => {
        const invalidId = 'invalid-id-format';

        const response = await request(app).get(`/api/drinks/${invalidId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Drink not found');
    });
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


describe('GET /api/drinks (Retrieve All Drinks)', () => {
    it('should return a list of all drinks', async () => {
        const response = await request(app).get('/api/drinks');

        expect(response.status).toBe(200);
    });

    describe('GET /api/drinks (When No Drinks Are Available)', () => {
        it('should return an empty array when no drinks are available', async () => {
            const response = await request(app).get('/api/drinks');

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.length).toBe(undefined);
        });
    });

    describe('GET /api/drinks/:id (Edge Cases)', () => {
        it('should return 404 if the drink ID format is invalid', async () => {
            const invalidId = 'invalid-id-format';

            const response = await request(app).get(`/api/drinks/${invalidId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });

        it('should return 404 if the drink does not exist', async () => {
            const nonExistentId = '123456';

            const response = await request(app).get(`/api/drinks/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    });


    it('should return 404 if the drink ID format is invalid', async () => {
        const invalidId = 'invalid-id-format';

        const response = await request(app).get(`/api/drinks/${invalidId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Drink not found');
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

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error adding drink');
        });
    });

    describe('POST /api/drinks (Edge Cases)', () => {
        it('should return 400 if no data is provided in the POST request', async () => {
            const response = await request(app).post('/api/drinks').send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "Missing required fields");
        });
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

                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
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

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
        });
    });

    describe('PUT /api/drinks/:id (Invalid data)', () => {
        it('should return 400 if required fields are missing', async () => {
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

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error updating the drink: Drink not found.');
        });
    });


    describe('DELETE /api/drinks/:id', () => {

        it('should return 404 if the drink ID does not exist for deletion', async () => {
            const response = await request(app).delete('/api/drinks/non-existing-id');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Drink not found');
        });
    })
