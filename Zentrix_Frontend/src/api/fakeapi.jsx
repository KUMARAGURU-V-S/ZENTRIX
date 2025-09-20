export const generateReport = (username) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const report = {
        id: Date.now(),
        username: username,
        date: new Date().toLocaleDateString(),
        summary: `The AI-driven analysis of ${username}'s coding performance indicates a strong affinity for algorithmic problem-solving. A consistent increase in submission volume suggests a disciplined approach to skill development. While the user excels in data structures, there are opportunities for improvement in optimizing space complexity, particularly in advanced dynamic programming challenges.`,
        performanceMetrics: {
          problemSolved: 650,
          averageTime: "12 min",
          accuracy: "92%",
          languages: ["Python", "C++", "JavaScript", "Rust"],
        },
        strengths: [
          "Dynamic Programming",
          "Graph Traversal",
          "Recursion",
          "Data Structures",
        ],
        weaknesses: [
          "Greedy Algorithms",
          "Space Optimization",
          "Competitive Programming Speed",
        ],
        difficultyBreakdown: [
          { difficulty: "Easy", count: 400 },
          { difficulty: "Medium", count: 200 },
          { difficulty: "Hard", count: 50 },
        ],
      };
      resolve(report);
    }, 1500);
  });
};
