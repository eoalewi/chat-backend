import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export type AuthedSocket = Socket & { user?: { id: number; email: string } };

export function socketAuthMiddleware(
  socket: AuthedSocket,
  next: (err?: Error) => void,
) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.toString().split(" ")[1];
    if (!token) return next(new Error("Unauthorized: missing token"));
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    socket.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch {
    return next(new Error("Unauthorized: invalid token"));
  }
}
