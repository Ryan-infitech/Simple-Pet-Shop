#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import colors from "colors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

colors.setTheme({
  info: "blue",
  success: "green",
  warn: "yellow",
  error: "red",
});

// Helper function to create a formatted timestamp
function getTimestamp() {
  const now = new Date();
  return `[${now.toLocaleTimeString()}]`;
}

// Helper function to prefix each line of output with the server name and timestamp
function prefixOutput(data, serverName, color) {
  return data
    .toString()
    .trim()
    .split("\n")
    .map((line) => `${getTimestamp()} ${colors[color](serverName)}: ${line}`)
    .join("\n");
}

// Start backend server
function startBackend() {
  const backendPath = path.join(__dirname, "backend");
  console.log(
    colors.cyan(`${getTimestamp()} Starting backend server at ${backendPath}`)
  );

  const backend = spawn("node", ["server.js"], { cwd: backendPath });

  backend.stdout.on("data", (data) => {
    console.log(prefixOutput(data, "BACKEND", "info"));
  });

  backend.stderr.on("data", (data) => {
    console.error(prefixOutput(data, "BACKEND", "error"));
  });

  backend.on("close", (code) => {
    console.log(
      colors.yellow(`${getTimestamp()} Backend server exited with code ${code}`)
    );
    if (code !== 0 && code !== null) {
      startBackend(); // Restart if crashed
    }
  });

  return backend;
}

// Start frontend server
function startFrontend() {
  console.log(
    colors.cyan(`${getTimestamp()} Starting frontend development server`)
  );

  const frontend = spawn("npm", ["run", "dev"], { cwd: __dirname });

  frontend.stdout.on("data", (data) => {
    console.log(prefixOutput(data, "FRONTEND", "success"));
  });

  frontend.stderr.on("data", (data) => {
    console.error(prefixOutput(data, "FRONTEND", "error"));
  });

  frontend.on("close", (code) => {
    console.log(
      colors.yellow(
        `${getTimestamp()} Frontend server exited with code ${code}`
      )
    );
  });

  return frontend;
}

// Start both servers
const backend = startBackend();
const frontend = startFrontend();

// Handle process termination
process.on("SIGINT", () => {
  console.log(colors.yellow(`\n${getTimestamp()} Shutting down servers...`));
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log(
  colors.cyan(
    `${getTimestamp()} Dev environment started. Press Ctrl+C to stop all servers.`
  )
);
