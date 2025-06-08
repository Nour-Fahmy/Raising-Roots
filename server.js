const express = require('express');
const path = require('path');
const app = express();


// Serve static files from the Raising-Roots directory
app.use(express.static(path.join(__dirname, 'Raising-Roots')));

// Serve homepage.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Raising-Roots', 'pages', 'homepage.html'));
});

// Start the server with error handling
const PORT = process.env.PORT || 4000; // Changed to port 4000
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        server.close();
        app.listen(PORT + 1, () => {
            console.log(`Server is running on http://localhost:${PORT + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
}); 