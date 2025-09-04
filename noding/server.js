/**
 * Combined Node.js Express Server for Gemini Chat and Function Calling
 *
 * This server handles a chat session, a set of functions for Codeforces,
 * and a fallback for general conversations. It uses the ES module syntax.
 */

// ES Module Imports
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase.js'; // Ensure this file exists and exports 'db'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Get the API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHER_API_KEY;
const CODEFORCES_API_BASE = "https://codeforces.com/api";
const OPENWEATHERMAP_API_BASE = "https://api.openweathermap.org/data/2.5/weather";

if (!geminiApiKey) {
    console.error("Gemini API key is not defined. Please check your .env file.");
    process.exit(1);
}

if (!OPENWEATHERMAP_API_KEY) {
    console.warn("OpenWeatherMap API key is not defined. Weather functionality will not work.");
}

//
// ---------- API and Helper Functions ----------
//

async function makeCodeforcesRequest(endpoint) {
    try {
        const response = await axios.get(`${CODEFORCES_API_BASE}/${endpoint}`);
        if (response.data.status !== "OK") {
            throw new Error(`Codeforces API error: ${response.data.comment || 'Unknown error'}`);
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching Codeforces API:", error.message);
        throw new Error(`Failed to fetch Codeforces data. It might be a network error or an invalid handle.`);
    }
}

async function generateCodeforcesReport(handle) {
    try {
        const profileData = await makeCodeforcesRequest(`user.info?handles=${handle}`);
        const user = profileData.result[0];

        const ratingData = await makeCodeforcesRequest(`user.rating?handle=${handle}`);
        let ratingSummary = "No contests participated yet.";
        if (ratingData.status === "OK" && ratingData.result.length > 0) {
            const contests = ratingData.result.slice(-5);
            ratingSummary = contests.map(c =>
                `In ${c.contestName}, rating changed from ${c.oldRating} → ${c.newRating}.`
            ).join(" ");
        }

        const submissionData = await makeCodeforcesRequest(`user.status?handle=${handle}&from=1&count=1000`);
        let solvedSummary = "No solved problem data available.";
        if (submissionData.status === "OK") {
            const solved = new Set(
                submissionData.result
                    .filter(sub => sub.verdict === "OK")
                    .map(sub => `${sub.problem.contestId}-${sub.problem.index}`)
            );
            solvedSummary = `The user has solved around ${solved.size} unique problems.`;
        }

        const report = `
${user.handle} is a ${user.rank || "newcomer"} on Codeforces with a current rating of ${user.rating || "N/A"} (max: ${user.maxRating || "N/A"} as ${user.maxRank || "N/A"}).
They have a contribution score of ${user.contribution}.
${ratingSummary}
${solvedSummary}
        `.replace(/\s+/g, " ").trim();

        await setDoc(doc(db, "reports", `${handle}_${Date.now()}`), {
            handle,
            report,
            timestamp: new Date(),
        });

        return report;
    } catch (error) {
        throw new Error(`Failed to generate report for ${handle}: ${error.message}`);
    }
}

async function getCurrentTemperature(location) {
    if (!OPENWEATHERMAP_API_KEY) {
        return JSON.stringify({ error: "OpenWeatherMap API key is not configured on the server." });
    }
    try {
        const url = `${OPENWEATHERMAP_API_BASE}?q=${encodeURIComponent(location)}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`;
        const response = await axios.get(url);

        const weatherData = response.data;
        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;
        const city = weatherData.name;
        const country = weatherData.sys.country;

        const result = {
            location: `${city}, ${country}`,
            temperature: `${temperature}°C`,
            description: description
        };

        return JSON.stringify(result);
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(`Error fetching weather for ${location}:`, errorMessage);
        throw new Error(`Failed to get weather for ${location}. The location may be invalid or the API key is not working.`);
    }
}

//
// ---------- Gemini Tool Declarations ----------
//
const availableFunctions = {
    getCodeforcesUser: async (args) => {
        const data = await makeCodeforcesRequest(`user.info?handles=${args.handle}`);
        const user = data.result[0];
        return JSON.stringify({
            handle: user.handle,
            rank: user.rank || "Unrated",
            rating: user.rating || "N/A",
            maxRank: user.maxRank || "N/A",
            maxRating: user.maxRating || "N/A",
            contribution: user.contribution,
        });
    },
    generateCodeforcesReport: async (args) => {
        const report = await generateCodeforcesReport(args.handle);
        return JSON.stringify({ message: `Report generated for ${args.handle}`, report: report });
    },
    getReports: async () => {
        const snapshot = await getDocs(collection(db, "reports"));
        if (snapshot.empty) {
            return JSON.stringify({ message: "No reports found in Firestore." });
        }
        const reports = [];
        snapshot.forEach(doc => reports.push(doc.data().report));
        return JSON.stringify({ message: "Stored reports fetched successfully.", reports: reports.join("\n\n---\n\n") });
    },
    getCurrentTemperature: async (args) => {
        return await getCurrentTemperature(args.location);
    }
};

const tools = [
    {
        function_declarations: [
            {
                name: "getCodeforcesUser",
                description: "Fetch basic profile information for a Codeforces user.",
                parameters: {
                    type: "object",
                    properties: {
                        handle: {
                            type: "string",
                            description: "The Codeforces user handle.",
                        },
                    },
                    required: ["handle"],
                },
            },
            {
                name: "generateCodeforcesReport",
                description: "Generate a comprehensive report for a Codeforces user's profile, including rating history and solved problems. The report is saved to Firestore.",
                parameters: {
                    type: "object",
                    properties: {
                        handle: {
                            type: "string",
                            description: "The Codeforces user handle.",
                        },
                    },
                    required: ["handle"],
                },
            },
            {
                name: "getReports",
                description: "Fetch all previously generated reports stored in Firestore.",
                parameters: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "getCurrentTemperature",
                description: "Gets the current temperature for a given location.",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "The city name, e.g. London or New York",
                        },
                    },
                    required: ["location"],
                },
            },
        ],
    },
];

//
// ---------- Gemini API and Express Server ----------
//
const genAI = new GoogleGenerativeAI(geminiApiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: {
        parts: [{
            text: "You are a helpful assistant with access to tools for Codeforces reports and weather information. Use these tools when requested. If you are asked to get user info, generate a report, or get weather, call the appropriate function. If no function is needed, respond directly."
        }]
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Gemini Chat API server! The server is running.');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const chat = model.startChat({
            tools: tools,
        });

        const result = await chat.sendMessage(message);
        const response = result.response;

        console.log("Full Gemini Response (Turn 1):", JSON.stringify(result, null, 2));

        if (response.toolCalls && response.toolCalls.length > 0) {
            let toolResponses = [];
            for (const toolCall of response.toolCalls) {
                const functionName = toolCall.function.name;
                const functionArgs = toolCall.function.args;

                if (availableFunctions[functionName]) {
                    try {
                        const functionResponse = await availableFunctions[functionName](functionArgs);
                        toolResponses.push({
                            toolResponse: {
                                name: functionName,
                                content: functionResponse,
                            },
                        });
                    } catch (error) {
                        console.error(`Error executing function ${functionName}:`, error);
                        toolResponses.push({
                            toolResponse: {
                                name: functionName,
                                content: JSON.stringify({ error: `Failed to execute ${functionName}: ${error.message}` }),
                            },
                        });
                    }
                } else {
                    toolResponses.push({
                        toolResponse: {
                            name: functionName,
                            content: JSON.stringify({ error: `Function not found: ${functionName}` }),
                        },
                    });
                }
            }

            // --- THIS IS THE CRITICAL CHANGE FOR THE SECOND TURN ---
            const finalResult = await chat.sendMessage(toolResponses);
            const finalResponseText = finalResult.response.text();

            console.log("Full Gemini Response (Turn 2):", JSON.stringify(finalResult, null, 2));

            if (!finalResponseText) {
                return res.status(500).json({ response: 'Sorry, I could not generate a response based on the data. Please try again.' });
            }

            return res.json({ response: finalResponseText });
        } else {
            const text = response.text();
            return res.json({ response: text });
        }
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});