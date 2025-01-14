/* eslint-disable */

import React, { useEffect, useState } from 'react';
import AdminPage from './adminPage.js';
import CustomerPage from './customerPage.js';
import axios from "axios";
import './Homepage.css';

const App = () => {
    const [currentPage, setCurrentPage] = useState('landing'); // Track current page
    const [drinks, setDrinks] = useState([]); // Store fetched drinks data

    useEffect(() => {
        const loadDrinks = async () => {
            try {
                await fetchDrinks(); // Fetch drinks on mount
                console.log('Drinks loaded successfully');
            } catch (err) {
                console.error('Error in loadDrinks:', err);
            }
        };
        loadDrinks();
    }, []); // Empty dependency to run only once on mount

    const fetchDrinks = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/drinks');
            setDrinks(response.data.drinks || []); // Update state with drinks
        } catch (error) {
            console.error('Error fetching drinks:', error.message);
        }
    };

    const goHome = () => setCurrentPage('landing'); // Navigate to landing page

    // Render page based on the current state
    const renderPage = () => {
        if (currentPage === 'admin') {
            return <AdminPage goToHome={goHome} fetchDrinks={fetchDrinks} setDrinks={setDrinks} drinks={drinks} />;
        }
        if (currentPage === 'customer') {
            return <CustomerPage goToHome={goHome} drinks={drinks} />;
        }
        return (
            <div className="container">
                <h1>Welcome to the Drink Manager</h1>
                <button className="button" onClick={() => setCurrentPage('admin')}>Go to Admin Page</button>
                <button className="button" onClick={() => setCurrentPage('customer')}>Go to Customer Page</button>
            </div>
        );
    };

    return <div>{renderPage()}</div>;
};

export default App;
