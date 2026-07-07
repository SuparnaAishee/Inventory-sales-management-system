import { io, type Socket } from "socket.io-client";

// Strip the `/api/v1` (or any) path suffix — socket.io connects to the
// server's origin, not a REST path.
function getSocketUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";
  return new URL(apiBase).origin;
}

export function createSocket(token: string): Socket {
  return io(getSocketUrl(), {
    auth: { token },
    autoConnect: true,
  });
}
