import { createServer } from "node:http";

// Railway provides PORT, use it if available, otherwise use 3001
const PORT = process.env.PORT || process.env.HEALTH_PORT || 3001;

// Create a simple HTTP server for health checks
const server = createServer((req, res) => {
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
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

export { server };
