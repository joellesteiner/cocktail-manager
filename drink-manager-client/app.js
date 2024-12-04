const express = require('express');
const app = express();
const port = 3000;

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Drink Collection Manager!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);


});
