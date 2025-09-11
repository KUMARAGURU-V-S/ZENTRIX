import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { doc, setDoc, getDocs, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";

//
// ---------- Codeforces API ----------
//
const CODEFORCES_API_BASE = "https://codeforces.com/api";

async function makeCodeforcesRequest(endpoint) {
    try {
        const response = await fetch(`${CODEFORCES_API_BASE}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Codeforces API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching Codeforces API:", error);
        return null;
    }
}

//
// ---------- Generate Codeforces Report ----------
//
async function generateCodeforcesReport(handle) {
    // Fetch profile
    const profileData = await makeCodeforcesRequest(`user.info?handles=${handle}`);
    if (!profileData || profileData.status !== "OK") {
        throw new Error(`Failed to fetch Codeforces profile for ${handle}`);
    }
    const user = profileData.result[0];

    // Fetch rating history
    const ratingData = await makeCodeforcesRequest(`user.rating?handle=${handle}`);
    let ratingSummary = "No contests participated yet.";
    if (ratingData && ratingData.status === "OK" && ratingData.result.length > 0) {
        const contests = ratingData.result.slice(-5);
        ratingSummary = contests.map(c =>
            `In ${c.contestName}, rating changed from ${c.oldRating} → ${c.newRating}.`
        ).join(" ");
    }

    // Fetch submissions (unique problems solved)
    const submissionData = await makeCodeforcesRequest(`user.status?handle=${handle}&from=1&count=1000`);
    let solvedSummary = "No solved problem data available.";
    if (submissionData && submissionData.status === "OK") {
        const solved = new Set(
            submissionData.result
                .filter(sub => sub.verdict === "OK")
                .map(sub => `${sub.problem.contestId}-${sub.problem.index}`)
        );
        solvedSummary = `The user has solved around ${solved.size} unique problems.`;
    }

    // Cleaned final report
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
// ---------- MCP Server ----------
//
const server = new McpServer({
    name: "zentrix-task-scheduler",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

//
// ---------- Task Scheduler Tools ----------
//
server.tool("create-task", "Create a new task", {
    description: z.string(),
    deadline: z.string().datetime(),
}, async ({ description, deadline }) => {
    try {
        const id = `task_${Date.now()}`;
        await setDoc(doc(db, "tasks", id), {
            id,
            description,
            deadline,
        });
        return { content: [{ type: "text", text: `✅ Task created: ${description}` }] };
    } catch (err) {
        console.error(err);
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
});

server.tool("get-tasks", "Fetch all tasks from Firestore", {
    sortBy: z.enum(["deadline", "description"]).optional(),
}, async ({ sortBy }) => {
    try {
        const snapshot = await getDocs(collection(db, "tasks"));
        if (snapshot.empty) {
            return { content: [{ type: "text", text: "No tasks found in Firestore." }] };
        }
        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push(doc.data());
        });

        if (sortBy) {
            tasks.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1;
                if (a[sortBy] > b[sortBy]) return 1;
                return 0;
            });
        }

        return { content: [{ type: "json", json: tasks }] };
    } catch (err) {
        console.error("Error fetching tasks:", err);
        return { content: [{ type: "text", text: "Failed to fetch tasks from Firestore." }] };
    }
});

server.tool("update-task", "Update a task", {
    id: z.string(),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
}, async ({ id, description, deadline }) => {
    try {
        const data = {};
        if (description) data.description = description;
        if (deadline) data.deadline = deadline;
        await updateDoc(doc(db, "tasks", id), data);
        return { content: [{ type: "text", text: `✅ Task updated: ${id}` }] };
    } catch (err) {
        console.error(err);
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
});

server.tool("delete-task", "Delete a task", {
    id: z.string(),
}, async ({ id }) => {
    try {
        await deleteDoc(doc(db, "tasks", id));
        return { content: [{ type: "text", text: `✅ Task deleted: ${id}` }] };
    } catch (err) {
        console.error(err);
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
});


//
// ---------- Codeforces Tools ----------
//
server.tool("get-codeforces-user", "Fetch Codeforces user profile", {
    handle: z.string(),
}, async ({ handle }) => {
    const data = await makeCodeforcesRequest(`user.info?handles=${handle}`);
    if (!data || data.status !== "OK") {
        return { content: [{ type: "text", text: `Failed to fetch data for ${handle}` }] };
    }
    const user = data.result[0];
    const text = [
        `Handle: ${user.handle}`,
        `Rank: ${user.rank || "Unrated"}`,
        `Rating: ${user.rating || "N/A"}`,
        `Max Rank: ${user.maxRank || "N/A"}`,
        `Max Rating: ${user.maxRating || "N/A"}`,
        `Contribution: ${user.contribution}`,
    ].join("\n");
    return { content: [{ type: "text", text }] };
});

server.tool("generate-codeforces-report", "Generate and save Codeforces report into Firestore", {
    handle: z.string(),
}, async ({ handle }) => {
    try {
        const report = await generateCodeforcesReport(handle);
        return { content: [{ type: "text", text: `✅ Report generated & saved:\n\n${report}` }] };
    } catch (err) {
        console.error(err);
        return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
});

server.tool("get-reports", "Fetch all stored reports from Firestore", {}, async () => {
    try {
        const snapshot = await getDocs(collection(db, "reports"));
        if (snapshot.empty) {
            return { content: [{ type: "text", text: "No reports found in Firestore." }] };
        }
        const reports = [];
        snapshot.forEach(doc => {
            reports.push(doc.data().report);
        });
        return { content: [{ type: "text", text: reports.join("\n\n---\n\n") }] };
    } catch (err) {
        console.error("Error fetching reports:", err);
        return { content: [{ type: "text", text: "Failed to fetch reports from Firestore." }] };
    }
});

//
// ---------- Main ----------
//
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 ZENTRIX MCP Server running...");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
