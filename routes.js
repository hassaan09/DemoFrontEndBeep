// routes.js
const path = require('path');
const express = require('express');

// Function to define the routes
module.exports = (app) => {
    // Serve index.html for the root route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Serve chat.html for the '/chat' route
    app.get('/chat', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    });

    // Optionally, serve other static files (like CSS, JS in the public folder)
    app.use(express.static(path.join(__dirname, 'public')));
};
