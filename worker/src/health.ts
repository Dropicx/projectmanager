/**
 * Health Check Server - Worker Service Monitoring
 *
 * This module provides a simple HTTP server for health monitoring
 * of the worker service. It's essential for:
 *
 * - Railway deployment health checks
 * - Load balancer health monitoring
 * - Service discovery and monitoring
 * - Debugging and troubleshooting
 *
 * The server responds to health check requests with service status
 * and timestamp information for monitoring systems.
 */

import { createServer } from "node:http";

// Determine the port for the health check server
// Railway provides PORT, use it if available, otherwise use 3001
const PORT = process.env.PORT || process.env.HEALTH_PORT || 3001;

/**
 * Create a simple HTTP server for health checks
 *
 * Responds to health check requests with JSON status information.
 * Used by Railway and other monitoring systems to verify service health.
 */
const server = createServer((req, res) => {
  // Handle health check endpoints
  if (req.url === "/health" || req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "worker",
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    // Return 404 for all other requests
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Start the health check server with error handling
server
  .listen(PORT, () => {
    console.log(`Health check server listening on port ${PORT}`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already in use, health check server not started`);
      // Don't crash the worker, just disable health checks
      server.close();
    } else {
      console.error("Health check server error:", err);
    }
  });

// Export the server for potential external access
export { server };
