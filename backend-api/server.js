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

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);
  // For now, just echo the message back with a simple reply.
  res.json({ reply: `You said: "${message}". I am still under development.` });
});

app.post('/api/reports', async (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ message: 'Username (handle) is required.' });
  }

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

    const docRef = await addDoc(collection(db, "reports"), report);
    res.status(201).json({ ...report, id: docRef.id });

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