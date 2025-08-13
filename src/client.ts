import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";

// Simple JSON type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

let nextId = 1;

function writeJSON(proc: ChildProcessWithoutNullStreams, msg: Json): number {
  const id = msg.id ?? nextId++;
  msg.id = id;
  proc.stdin.write(JSON.stringify(msg) + "\n");
  return id;
}

function buildInitialize(): Json {
  return {
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "local-mcp-client", version: "1.0.0" },
    },
  };
}

function buildToolCall(name: string, args: Record<string, unknown>): Json {
  return {
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name, arguments: args },
  };
}

function startServer() {
  // Use CWD since we run client via: node build/client.js
  const serverPath = path.resolve(process.cwd(), "build/index.js");
  const nodeExe = process.execPath; // current node runtime

  const proc = spawn(nodeExe, [serverPath], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stdoutBuf = "";
  const pending = new Map<number, (res: Json) => void>();

  const whenBanner = new Promise<void>((resolve) => {
    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      // Surface server logs to user
      process.stderr.write(text);
      if (text.includes("Weather MCP Server running")) {
        resolve();
      }
    });
  });

  proc.stdout.on("data", (chunk: Buffer) => {
    stdoutBuf += chunk.toString();
    let idx: number;
    while ((idx = stdoutBuf.indexOf("\n")) >= 0) {
      const line = stdoutBuf.slice(0, idx).trim();
      stdoutBuf = stdoutBuf.slice(idx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        if (typeof msg.id === "number" && pending.has(msg.id)) {
          pending.get(msg.id)!(msg);
          pending.delete(msg.id);
        } else {
          // Unsolicited message
          console.log("[server]", JSON.stringify(msg));
        }
      } catch {
        // ignore non-JSON
      }
    }
  });

  function request<T = Json>(message: Json): Promise<T> {
    return new Promise<T>((resolve) => {
      const id = writeJSON(proc, message);
      pending.set(id, (msg) => resolve(msg as T));
    });
  }

  return { proc, request, whenBanner };
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || !["forecast", "alerts"].includes(cmd)) {
    console.log("Usage:");
    console.log("  node build/client.js forecast <lat> <lon>");
    console.log("  node build/client.js alerts <STATE_CODE>");
    process.exit(1);
  }

  const { proc, request, whenBanner } = startServer();
  await whenBanner; // wait for server to be ready

  // initialize first
  await request(buildInitialize());

  if (cmd === "forecast") {
    const [latStr, lonStr] = args;
    const latitude = Number(latStr);
    const longitude = Number(lonStr);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.error("Provide numeric lat lon, e.g. 37.7749 -122.4194");
      process.exit(1);
    }
    const resp: Json = await request(buildToolCall("get-forecast", { latitude, longitude }));
    console.log(resp?.result?.content?.[0]?.text ?? "No content");
  } else {
    const [state] = args;
    if (!state || state.length !== 2) {
      console.error("Provide 2-letter state code, e.g. CA");
      process.exit(1);
    }
    const resp: Json = await request(buildToolCall("get-alerts", { state }));
    console.log(resp?.result?.content?.[0]?.text ?? "No content");
  }

  setTimeout(() => proc.kill(), 250);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
