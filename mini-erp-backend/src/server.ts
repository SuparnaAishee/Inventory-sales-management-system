import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./realtime/socket";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const app = createApp();
const httpServer = http.createServer(app);
initSocket(httpServer);

// Listen immediately so health checks succeed even while MongoDB is still
// connecting (or unreachable) — DB-backed routes fail on their own instead
// of the whole process (including /health) hanging on a slow/dead cluster.
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err instanceof Error ? err.message : err);
});
