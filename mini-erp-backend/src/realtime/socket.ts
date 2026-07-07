import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { UserRole } from "../modules/user/user.types";

interface SocketJwtPayload {
  sub: string;
  role: UserRole;
}

let io: SocketIOServer | undefined;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      credentials: true,
    },
  });

  // Same JWT used for REST auth, passed via the client's `auth.token` handshake
  // field — keeps the realtime channel behind the same access control.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token, secret) as SocketJwtPayload;
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  return io;
}

export function emitStockLow(product: { id: string; name: string; sku: string; stockQuantity: number }) {
  io?.emit("stock:low", product);
}
