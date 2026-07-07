import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./realtime/socket";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

async function start() {
  try {
    await connectDB();
    const app = createApp();
    const httpServer = http.createServer(app);
    initSocket(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
