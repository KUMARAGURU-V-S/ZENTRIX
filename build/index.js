/**
 * Single-file Node.js Express Server for Gemini Chat Application
 *
 * This server provides an API endpoint to handle chat messages and
 * interact with the Gemini API using function calling for Codeforces.
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { z } from 'zod';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase.js'; // <-- Your Firebase initialization file
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Get the API keys from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    console.error("Gemini API key is not defined. Please check your .env file.");
    process.exit(1);
}

//
// ---------- Codeforces API and Helper Functions ----------
//
const CODEFORCES_API_BASE = "https://codeforces.com/api";

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
    // Fetch profile
    const profileData = await makeCodeforcesRequest(`user.info?handles=${handle}`);
    const user = profileData.result[0];

    // Fetch rating history
    const ratingData = await makeCodeforcesRequest(`user.rating?handle=${handle}`);
    let ratingSummary = "No contests participated yet.";
    if (ratingData.status === "OK" && ratingData.result.length > 0) {
        const contests = ratingData.result.slice(-5);
        ratingSummary = contests.map(c =>
            `In ${c.contestName}, rating changed from ${c.oldRating} → ${c.newRating}.`
        ).join(" ");
    }

    // Fetch submissions (unique problems solved)
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

    // Save into Firestore (collection: reports)
    await setDoc(doc(db, "reports", `${handle}_${Date.now()}`), {
        handle,
        report,
        timestamp: new Date(),
    });

    return report;
}

//
// ---------- Gemini Tool Declarations ----------
//
// Map of available functions that the model can call
const availableFunctions = {
    getCodeforcesUser: async ({ handle }) => {
        const data = await makeCodeforcesRequest(`user.info?handles=${handle}`);
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
    generateCodeforcesReport: async ({ handle }) => {
        const report = await generateCodeforcesReport(handle);
        return JSON.stringify({ message: `Report generated for ${handle}`, report: report });
    },
    getReports: async () => {
        const snapshot = await getDocs(collection(db, "reports"));
        if (snapshot.empty) {
            return JSON.stringify({ message: "No reports found in Firestore." });
        }
        const reports = [];
        snapshot.forEach(doc => reports.push(doc.data().report));
        return JSON.stringify({ message: "Stored reports fetched successfully.", reports: reports.join("\n\n---\n\n") });
    }
};

// Tool declarations for the Gemini API
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
            }
        ],
    },
];

//
// ---------- Gemini API and Express Server ----------
//
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/', (req, res) => {
    res.send('Welcome to the Gemini Chat API server! The server is running.');
});

// API endpoint for chat with function calling
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

        if (response.toolCalls && response.toolCalls.length > 0) {
            let toolResponses = [];
            for (const toolCall of response.toolCalls) {
                const functionName = toolCall.function.name;
                const functionArgs = toolCall.function.args;
                
                if (availableFunctions[functionName]) {
                    const functionResponse = await availableFunctions[functionName](functionArgs);
                    toolResponses.push({
                        toolResponse: {
                            name: functionName,
                            content: functionResponse,
                        },
                    });
                } else {
                    toolResponses.push({
                        toolResponse: {
                            name: functionName,
                            content: JSON.stringify({ error: `Function not found: ${functionName}` }),
                        },
                    });
                }
            }

            const finalResult = await chat.sendMessage(toolResponses);
            const finalResponseText = finalResult.response.text();

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

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
