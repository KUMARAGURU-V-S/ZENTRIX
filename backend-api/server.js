import express from 'express';
import axios from 'axios';

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

app.post('/api/reports', (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ message: 'Username (handle) is required.' });
  }

  // For now, we'll use a slightly modified version of the fakeapi logic.
  // In the future, this would involve fetching real data and performing analysis.
  const report = {
    id: Date.now(),
    username: handle,
    date: new Date().toLocaleDateString(),
    summary: `The AI-driven analysis of ${handle}'s coding performance indicates a strong affinity for algorithmic problem-solving. A consistent increase in submission volume suggests a disciplined approach to skill development. While the user excels in data structures, there are opportunities for improvement in optimizing space complexity, particularly in advanced dynamic programming challenges.`,
    performanceMetrics: {
      problemSolved: Math.floor(Math.random() * 1000),
      averageTime: `${Math.floor(Math.random() * 20) + 5} min`,
      accuracy: `${Math.floor(Math.random() * 30) + 70}%`,
      languages: ["Python", "C++", "JavaScript", "Rust"].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2),
    },
    strengths: [
      "Dynamic Programming",
      "Graph Traversal",
      "Recursion",
      "Data Structures",
      "Bit Manipulation",
      "Number Theory"
    ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2),
    weaknesses: [
      "Greedy Algorithms",
      "Space Optimization",
      "Competitive Programming Speed",
      "Combinatorics",
      "String Algorithms"
    ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2),
    difficultyBreakdown: [
      { difficulty: "Easy", count: Math.floor(Math.random() * 500) },
      { difficulty: "Medium", count: Math.floor(Math.random() * 300) },
      { difficulty: "Hard", count: Math.floor(Math.random() * 100) },
    ],
  };

  res.json(report);
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});