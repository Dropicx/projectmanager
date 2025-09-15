#!/usr/bin/env node

const { spawn } = require('child_process');

const port = process.env.PORT || 3000;

console.log(`Starting Next.js server on port ${port}...`);

const child = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});