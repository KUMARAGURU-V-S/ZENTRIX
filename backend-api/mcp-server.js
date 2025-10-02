import { McpServer, McpServerOptions, McpTool } from '@modelcontextprotocol/sdk';
import { z } from 'zod';
import axios from 'axios';

// This is a simplified version of the report generation logic from server.js
// In a real application, this would be shared in a common library.
async function generateReport(handle) {
  const [infoResponse, statusResponse] = await Promise.all([
    axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
    axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
  ]);

  if (infoResponse.data.status !== 'OK' || statusResponse.data.status !== 'OK') {
    throw new Error('Could not fetch user data from Codeforces');
  }

  const cfUserData = infoResponse.data.result[0];
  const submissions = statusResponse.data.result;

  const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
  const solvedProblems = new Set(acceptedSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`));

  return {
    username: handle,
    rating: cfUserData.rating,
    rank: cfUserData.rank,
    solvedProblems: solvedProblems.size,
  };
}

const reportTool = new McpTool({
  name: 'generate_zentrix_report',
  description: 'Generates a performance report for a given Codeforces username.',
  input: z.object({
    username: z.string().describe('The Codeforces username to generate the report for.'),
  }),
  output: z.object({
    username: z.string(),
    rating: z.number(),
    rank: z.string(),
    solvedProblems: z.number(),
  }),
  run: async ({ username }) => {
    console.log(`Generating report for ${username}...`);
    const report = await generateReport(username);
    console.log('Report generated:', report);
    return report;
  },
});

const options = new McpServerOptions({
  tools: [reportTool],
});

const server = new McpServer(options);

server.listen();
