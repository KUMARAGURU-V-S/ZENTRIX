import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Initialize Gemini AI
console.log('Initializing Gemini AI...');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'undefined');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try different model names that are known to work
const modelNames = ['gemini-1.5-flash', 'gemini-pro'];

let model;
for (const modelName of modelNames) {
  try {
    console.log(`Trying model: ${modelName}`);
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Successfully initialized model: ${modelName}`);
    break;
  } catch (error) {
    console.log(`Model ${modelName} failed:`, error.message);
  }
}

if (!model) {
  console.error('Failed to initialize any Gemini model');
  process.exit(1);
}

// In-memory conversation history (for simplicity, in production use database)
const conversationHistory = [];

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS middleware to allow requests from the extension
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for now, refine later
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Codeforces API endpoint
app.get('/codeforces/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    if (response.data.status === 'OK') {
      res.json(response.data.result[0]);
    } else {
      res.status(404).json({ message: 'Codeforces user not found', error: response.data.comment });
    }
  } catch (error) {
    console.error('Error fetching Codeforces data:', error.message);
    res.status(500).json({ message: 'Error fetching Codeforces data', error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set. Please create a .env file in the backend-api directory and add your API key.');
    return res.status(500).json({
      error: 'The AI chat feature is not configured on the server.',
      details: 'The GEMINI_API_KEY is missing.'
    });
  }

  const { message } = req.body;
  console.log('Chat API: Received message:', message);

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Add user message to history
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    // Keep only last 20 messages to avoid token limits
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude the current message
    });

    console.log('Chat API: Sending message to Gemini API...');
    console.log('Chat API: Using model:', model.model);
    console.log('Chat API: Chat history length:', conversationHistory.length);
    // Send message and get response
    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    console.log('Chat API: Received response from Gemini API:', reply);

    // Add AI response to history
    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

    console.log('Chat API: Sending reply:', reply);
    res.json({ reply });

  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // If Gemini fails, provide a fallback response
    const fallbackResponses = [
      "I'm currently experiencing some technical difficulties. Please try again later.",
      "Sorry, I'm having trouble connecting to my AI services right now. Can you try again?",
      "There seems to be an issue with the AI service. Please check back later.",
      "I'm temporarily unavailable. Please try your request again in a moment."
    ];

    const fallbackReply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    console.log('Chat API: Using fallback response:', fallbackReply);
    res.json({ reply: fallbackReply });
  }
});

app.post('/api/reports', async (req, res) => {
  const { handle, platform = 'codeforces' } = req.body;
  console.log('Received report request:', { handle, platform });

  if (!handle) {
    return res.status(400).json({ message: 'Username (handle) is required.' });
  }

  try {
    if (platform.toLowerCase() === 'codeforces') {
      try {
        // Fetch user data and submissions from Codeforces API
        const [infoResponse, statusResponse] = await Promise.all([
          axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
          axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
        ]);

        if (infoResponse.data.status !== 'OK') {
          return res.status(404).json({ message: 'Codeforces user not found' });
        }
        if (statusResponse.data.status !== 'OK') {
          return res.status(500).json({ message: 'Could not fetch user submissions from Codeforces' });
        }

        const cfUserData = infoResponse.data.result[0];
        const submissions = statusResponse.data.result;

        // --- Deeper Analysis Logic ---
        const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
        const solvedProblems = new Set(acceptedSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`));

        const languageCounts = acceptedSubmissions.reduce((acc, sub) => {
          acc[sub.programmingLanguage] = (acc[sub.programmingLanguage] || 0) + 1;
          return acc;
        }, {});

        const tagCounts = acceptedSubmissions.reduce((acc, sub) => {
          sub.problem.tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
          return acc;
        }, {});

        const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

        const strengths = sortedTags.slice(0, 3).map(entry => entry[0]);
        const weaknesses = sortedTags.slice(-3).map(entry => entry[0]); // Simple proxy for weaknesses

        const accuracy = submissions.length > 0 ? (acceptedSubmissions.length / submissions.length) * 100 : 0;

        const report = {
          username: handle,
          date: new Date().toISOString(),
          summary: `Analysis of ${solvedProblems.size} solved problems. ${handle} has a rating of ${cfUserData.rating || 'N/A'} and a rank of ${cfUserData.rank || 'N/A'}. Strengths appear to be in ${strengths.join(', ')}.`,
          performanceMetrics: {
            problemSolved: solvedProblems.size,
            averageTime: `${Math.floor(Math.random() * 20) + 5} min`, // Placeholder
            accuracy: `${accuracy.toFixed(2)}%`,
            languages: Object.keys(languageCounts),
          },
          strengths: strengths,
          weaknesses: weaknesses,
          difficultyBreakdown: acceptedSubmissions.reduce((acc, sub) => {
            const difficulty = sub.problem.rating ? (sub.problem.rating < 1200 ? 'Easy' : sub.problem.rating < 1600 ? 'Medium' : 'Hard') : 'N/A';
            const existing = acc.find(d => d.difficulty === difficulty);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ difficulty, count: 1 });
            }
            return acc;
          }, []),
          codeforcesData: {
            rating: cfUserData.rating,
            rank: cfUserData.rank,
            maxRating: cfUserData.maxRating,
            maxRank: cfUserData.maxRank,
            avatar: cfUserData.avatar,
          }
        };

        console.log('Saving report to Firebase...');
        try {
          const docRef = await addDoc(collection(db, "reports"), report);
          console.log('Report saved successfully with ID:', docRef.id);
          return res.status(201).json({ ...report, id: docRef.id });
        } catch (firebaseError) {
          console.error('Firebase save error:', firebaseError);
          // Return report without saving to Firebase for now
          return res.status(201).json({ ...report, id: 'temp-id' });
        }

      } catch (apiError) {
        console.error('Codeforces API error:', apiError);
        // Return mock data for testing
        const mockReport = {
          username: handle,
          date: new Date().toISOString(),
          summary: `Mock analysis for ${handle}. This is test data since API is unavailable.`,
          performanceMetrics: {
            problemSolved: 50,
            averageTime: '15 min',
            accuracy: '75%',
            languages: ['C++', 'Python'],
          },
          strengths: ['Data Structures', 'Algorithms'],
          weaknesses: ['Dynamic Programming'],
          difficultyBreakdown: [
            { difficulty: 'Easy', count: 20 },
            { difficulty: 'Medium', count: 20 },
            { difficulty: 'Hard', count: 10 },
          ],
          codeforcesData: {
            rating: 1500,
            rank: 'Specialist',
            maxRating: 1600,
            maxRank: 'Specialist',
            avatar: '',
          }
        };
        console.log('API failed, returning mock report without Firebase...');
        return res.status(201).json({ ...mockReport, id: 'mock-id' });
      }
    } else if (platform.toLowerCase() === 'leetcode') {
      // Fetch from LeetCode stats API
      const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${handle}`);
      if (response.data.status === 'success') {
        const lcData = response.data;
        const report = {
          username: handle,
          platform: 'leetcode',
          date: new Date().toISOString(),
          summary: `LeetCode analysis: ${lcData.totalSolved} problems solved. Easy: ${lcData.easySolved}, Medium: ${lcData.mediumSolved}, Hard: ${lcData.hardSolved}. Acceptance rate: ${lcData.acceptanceRate}%.`,
          performanceMetrics: {
            problemSolved: lcData.totalSolved,
            averageTime: 'N/A', // Not available
            accuracy: `${lcData.acceptanceRate}%`,
            languages: [], // Not available
          },
          strengths: [], // Placeholder
          weaknesses: [], // Placeholder
          difficultyBreakdown: [
            { difficulty: 'Easy', count: lcData.easySolved },
            { difficulty: 'Medium', count: lcData.mediumSolved },
            { difficulty: 'Hard', count: lcData.hardSolved },
          ],
          leetcodeData: {
            ranking: lcData.ranking,
            totalSolved: lcData.totalSolved,
            acceptanceRate: lcData.acceptanceRate,
          }
        };
        console.log('Saving LeetCode report to Firebase...');
        try {
          const docRef = await addDoc(collection(db, "reports"), report);
          console.log('LeetCode report saved successfully with ID:', docRef.id);
          res.status(201).json({ ...report, id: docRef.id });
        } catch (firebaseError) {
          console.error('Firebase save error:', firebaseError);
          // Return report without saving to Firebase for now
          res.status(201).json({ ...report, id: 'temp-id' });
        }
      } else {
        return res.status(404).json({ message: 'LeetCode user not found' });
      }
    } else {
      return res.status(400).json({ message: 'Platform not supported yet.' });
    }

  } catch (error) {
    console.error("Error generating report: ", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
  });
}

export default app;