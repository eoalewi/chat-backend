"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.toString().split(" ")[1];
        if (!token)
            return next(new Error("Unauthorized: missing token"));
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        socket.user = { id: decoded.id, email: decoded.email };
        return next();
    }
    catch {
        return next(new Error("Unauthorized: invalid token"));
    }
}
//# sourceMappingURL=authSocket.js.map