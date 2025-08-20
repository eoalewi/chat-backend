"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const db_1 = __importDefault(require("../config/db"));
const authSocket_1 = require("./authSocket");
const rateLimiter_1 = require("../utils/rateLimiter");
const room_service_1 = __importDefault(require("../modules/room/room.service"));
const msgLimiter = new rateLimiter_1.SlidingWindowRateLimiter(5, 10_000); // 5 messages / 10s
const onlineCountByUser = new Map(); // connections per user
function setupSocket(io) {
    io.use(authSocket_1.socketAuthMiddleware);
    io.on("connection", async (socket) => {
        const userId = socket.user.id;
        console.log("User", socket.user);
        console.log("User inside", socket.user.id);
        // 👇 Add this here
        socket.onAny((event, ...args) => {
            console.log("📡 Event received:", event, args);
        });
        // console.log("Handlers:", socket.eventNames());
        socket.on("join_room", async (payload, cb) => {
            console.log("join_room received:", payload, "cb exists?", !!cb);
            try {
                if (!payload?.roomId)
                    throw new Error("roomId is required");
                const membership = await room_service_1.default.joinRoom(payload.roomId, userId);
                socket.join(`room:${payload.roomId}`);
                console.log(`User ${userId} joined room ${payload.roomId}`);
                if (cb)
                    cb({ ok: true, membership });
            }
            catch (e) {
                console.error("join_room error:", e);
                cb?.({ ok: false, error: e.message });
            }
        });
        // typing: { roomId, isTyping }
        socket.on("typing", ({ roomId, isTyping }) => {
            if (!roomId)
                return;
            socket
                .to(`room:${roomId}`)
                .emit("typing", { roomId, userId, isTyping });
        });
        // send_message: { roomId, content }
        socket.on("send_message", async ({ roomId, content }, cb) => {
            try {
                if (!roomId)
                    throw new Error("roomId is required");
                if (!content || !content.trim())
                    throw new Error("Message content cannot be empty");
                //  Rate limit
                const ok = msgLimiter.allow(`user:${userId}`);
                if (!ok)
                    throw new Error("Rate limit exceeded. Try again shortly.");
                // Ensure membership
                const membership = await db_1.default.roomMember.findUnique({
                    where: { userId_roomId: { userId, roomId } },
                });
                if (!membership)
                    throw new Error(`User ${userId} is not a member of room ${roomId}`);
                // Save the message
                const message = await db_1.default.message.create({
                    data: { content: content.trim(), roomId, senderId: userId },
                    include: {
                        sender: { select: { id: true, username: true, email: true } },
                    },
                });
                // Create delivery receipts for all room members except sender
                const members = await db_1.default.roomMember.findMany({
                    where: { roomId },
                    select: { userId: true },
                });
                const now = new Date();
                const ops = members
                    .filter((m) => m.userId !== userId)
                    .map((m) => db_1.default.messageReceipt.upsert({
                    where: {
                        messageId_userId: { messageId: message.id, userId: m.userId },
                    },
                    update: { delivered: true, deliveredAt: now },
                    create: {
                        messageId: message.id,
                        userId: m.userId,
                        delivered: true,
                        deliveredAt: now,
                    },
                }));
                await db_1.default.$transaction(ops);
                //  Broadcast the new message
                io.to(`room:${roomId}`).emit("receive_message", {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    roomId,
                    sender: message.sender,
                });
                // Notify recipients about delivery
                io.to(`room:${roomId}`).emit("delivered", {
                    messageId: message.id,
                    roomId,
                    userIds: members
                        .filter((m) => m.userId !== userId)
                        .map((m) => m.userId),
                    deliveredAt: now,
                });
                cb?.({ ok: true, message });
            }
            catch (e) {
                console.error("send_message error:", e);
                cb?.({ ok: false, error: e.message });
            }
        });
        // read_message: { roomId, messageIds: number[] }
        socket.on("read_message", async ({ roomId, messageIds }, cb) => {
            try {
                if (!roomId ||
                    !Array.isArray(messageIds) ||
                    messageIds.length === 0) {
                    throw new Error("roomId and messageIds are required");
                }
                // ensure membership
                const membership = await db_1.default.roomMember.findUnique({
                    where: { userId_roomId: { userId, roomId } },
                });
                if (!membership)
                    throw new Error("You are not a member of this room");
                const now = new Date();
                const ops = messageIds.map((id) => db_1.default.messageReceipt.upsert({
                    where: { messageId_userId: { messageId: id, userId } },
                    update: {
                        read: true,
                        readAt: now,
                        delivered: true,
                        deliveredAt: now,
                    },
                    create: {
                        messageId: id,
                        userId,
                        read: true,
                        readAt: now,
                        delivered: true,
                        deliveredAt: now,
                    },
                }));
                await db_1.default.$transaction(ops);
                io.to(`room:${roomId}`).emit("read", {
                    roomId,
                    messageIds,
                    userId,
                    readAt: now,
                });
                cb?.({ ok: true });
            }
            catch (e) {
                cb?.({ ok: false, error: e.message });
            }
        });
        socket.on("disconnect", async () => {
            const current = onlineCountByUser.get(userId) ?? 1;
            const next = Math.max(current - 1, 0);
            onlineCountByUser.set(userId, next);
            if (next === 0) {
                // mark last seen
                await db_1.default.user.update({
                    where: { id: userId },
                    data: { lastSeen: new Date() },
                });
                io.emit("user_status", { userId, status: "offline" });
            }
        });
        (async () => {
            try {
                const memberships = await db_1.default.roomMember.findMany({
                    where: { userId },
                    select: { roomId: true },
                });
                memberships.forEach((m) => socket.join(`room:${m.roomId}`));
                console.log("User auto-joined rooms:", memberships);
                const prev = onlineCountByUser.get(userId) ?? 0;
                onlineCountByUser.set(userId, prev + 1);
                if (prev === 0) {
                    io.emit("user_status", { userId, status: "online" });
                }
            }
            catch (err) {
                console.error("Error fetching memberships:", err);
            }
        })();
    });
}
//# sourceMappingURL=socketHandler.js.map