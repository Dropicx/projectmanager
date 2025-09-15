#!/usr/bin/env node

const { execSync } = require('child_process');

// Railway provides PORT as an environment variable
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log(`Starting Next.js server on ${host}:${port}...`);

try {
  // Use execSync to run Next.js with the correct port
  execSync(`npx next start -H ${host} -p ${port}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port.toString()
    }
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}