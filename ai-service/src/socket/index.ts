import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { handleAiChat } from "./handlers/ai.handler";

const getCorsOrigin = () => process.env.CORS_ORIGIN || "http://localhost:3000";

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: getCorsOrigin(),
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = verifyAccessToken(token);

      socket.data.user = {
        id: decoded.id,
        name: "",
        email: "",
      };

      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected: ${socket.data.user.id}");

    handleAiChat(socket);

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected: ${socket.data.user.id} - ${reason}");
    });
  });

  return io;
};
