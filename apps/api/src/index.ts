import "dotenv/config";
import app from "./app.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[api] listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown — Railway sends SIGTERM before killing the container
process.on("SIGTERM", () => {
  console.log("[api] SIGTERM received — draining connections…");
  server.close(() => {
    console.log("[api] HTTP server closed");
    process.exit(0);
  });
});
