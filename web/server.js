#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

// Railway provides PORT as an environment variable
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

console.log("Environment variables:");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(`Starting Next.js server on ${host}:${port}...`);

// Find the next binary
const nextBin = path.join(__dirname, "node_modules", ".bin", "next");

// Use spawn to run the Next.js server
const child = spawn(nextBin, ["start", "-H", host, "-p", port], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port.toString(),
  },
  shell: true,
});

child.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code);
});
