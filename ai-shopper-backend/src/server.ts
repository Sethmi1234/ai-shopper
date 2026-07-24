import dotenv from "dotenv";
import path from "path";
import http from "http";

const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`Could not load .env from ${envPath}:`, result.error.message);
}

import app from "./app";
import {connectDB} from "./config/database";
import {seedDemoUser} from "./config/seed";
import { initSocket } from "./socket";


const BASE_PORT = parseInt(process.env.PORT || "5000", 10);
let PORT = BASE_PORT;

const httpServer = http.createServer(app);
initSocket(httpServer);

function startServer(port: number) {
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

httpServer.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.warn(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
    PORT += 1;
    httpServer.close();
    startServer(PORT);
    return;
  }

  console.error("Server failed to start:", error);
  process.exit(1);
});

connectDB().then(() => {
  seedDemoUser();
  startServer(PORT);
}).catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});
