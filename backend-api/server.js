import express from 'express';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2x7FRB-d_jZJJkderBMZxG4zUIX0REig",
  authDomain: "zentrix-9c750.firebaseapp.com",
  projectId: "zentrix-9c750",
  storageBucket: "zentrix-9c750.firebasestorage.app",
  messagingSenderId: "167208189493",
  appId: "1:167208189493:web:6f0456d2ee94a208673b7c",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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

app.post('/api/reports', async (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ message: 'Username (handle) is required.' });
  }

  try {
    // Fetch user data from Codeforces API
    const cfResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (cfResponse.data.status !== 'OK') {
      return res.status(404).json({ message: 'Codeforces user not found' });
    }
    const cfUserData = cfResponse.data.result[0];

    // TODO: Fetch user submission data for more detailed analysis

    const report = {
      username: handle,
      date: new Date().toISOString(),
      summary: `The AI-driven analysis of ${handle}'s coding performance indicates a strong affinity for algorithmic problem-solving. Key metrics from Codeforces show a rating of ${cfUserData.rating || 'N/A'} with a rank of ${cfUserData.rank || 'N/A'}.`,
      performanceMetrics: {
        problemSolved: cfUserData.friendOfCount, // Using friendOfCount as a proxy for solved problems for now
        averageTime: `${Math.floor(Math.random() * 20) + 5} min`, // Placeholder
        accuracy: `${Math.floor(Math.random() * 30) + 70}%`, // Placeholder
        languages: ["Python", "C++", "JavaScript", "Rust"].sort(() => 0.5 - Math.random()).slice(0, 1), // Placeholder
      },
      strengths: [
        "Dynamic Programming",
        "Graph Traversal",
        "Data Structures",
      ].sort(() => 0.5 - Math.random()).slice(0, 2), // Placeholder
      weaknesses: [
        "Greedy Algorithms",
        "Space Optimization",
      ].sort(() => 0.5 - Math.random()).slice(0, 1), // Placeholder
      difficultyBreakdown: [
        { difficulty: "Easy", count: Math.floor(Math.random() * cfUserData.friendOfCount * 0.6) },
        { difficulty: "Medium", count: Math.floor(Math.random() * cfUserData.friendOfCount * 0.3) },
        { difficulty: "Hard", count: Math.floor(Math.random() * cfUserData.friendOfCount * 0.1) },
      ],
      codeforcesData: {
        rating: cfUserData.rating,
        rank: cfUserData.rank,
        maxRating: cfUserData.maxRating,
        maxRank: cfUserData.maxRank,
        avatar: cfUserData.avatar,
      }
    };

    const docRef = await addDoc(collection(db, "reports"), report);
    res.status(201).json({ ...report, id: docRef.id });

  } catch (error) {
    console.error("Error generating report: ", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});