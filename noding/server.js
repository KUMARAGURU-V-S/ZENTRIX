/**
 * Single-file Node.js Express Server for Gemini Chat Application
 *
 * This server provides a single API endpoint to handle chat messages
 * and interact with the Gemini API.
 *
 * Setup Instructions:
 * 1. Make sure you have Node.js and npm installed.
 * 2. In your project directory, run the following command to initialize npm and install dependencies:
 * npm init -y
 * npm install express cors dotenv @google/generative-ai
 * 3. Create a file named `.env` in the same directory.
 * 4. Add your Gemini API key to the `.env` file like this:
 * GEMINI_API_KEY="YOUR_API_KEY_HERE"
 * 5. Run the server from your terminal:
 * node server.js
 *
 * The server will start and listen on port 3000. You can then configure your
 * front-end application to send POST requests to http://localhost:3000/api/chat.
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("API key is not defined. Please check your .env file.");
    process.exit(1);
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.get('/', (req, res) => {
  res.send('Welcome to the Gemini Chat API server! The server is running.');
});
// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        // Start a new chat session
        const chat = model.startChat({
            history: [], // You can add conversation history here if needed
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
