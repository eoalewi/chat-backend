import { Server } from "socket.io";
import prisma from "../config/db";
import { socketAuthMiddleware, AuthedSocket } from "./authSocket";
import { SlidingWindowRateLimiter } from "../utils/rateLimiter";
import roomService from "../modules/room/room.service";

const msgLimiter = new SlidingWindowRateLimiter(5, 10_000); // 5 messages / 10s
const onlineCountByUser = new Map<number, number>(); // connections per user

export function setupSocket(io: Server) {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: AuthedSocket) => {
    const userId = socket.user!.id;
    console.log("User", socket.user);
    console.log("User inside", socket.user!.id);

    // 👇 Add this here
    socket.onAny((event, ...args) => {
      console.log("📡 Event received:", event, args);
    });

    // console.log("Handlers:", socket.eventNames());

    socket.on(
      "join_room",
      async (payload: { roomId: number }, cb?: Function) => {
        console.log("join_room received:", payload, "cb exists?", !!cb);
        try {
          if (!payload?.roomId) throw new Error("roomId is required");

          const membership = await roomService.joinRoom(payload.roomId, userId);
          socket.join(`room:${payload.roomId}`);

          console.log(`User ${userId} joined room ${payload.roomId}`);

          if (cb) cb({ ok: true, membership });
        } catch (e: any) {
          console.error("join_room error:", e);
          cb?.({ ok: false, error: e.message });
        }
      },
    );

    // typing: { roomId, isTyping }
    socket.on(
      "typing",
      ({ roomId, isTyping }: { roomId: number; isTyping: boolean }) => {
        if (!roomId) return;
        socket
          .to(`room:${roomId}`)
          .emit("typing", { roomId, userId, isTyping });
      },
    );

    // send_message: { roomId, content }
    socket.on("send_message", async ({ roomId, content }, cb?: Function) => {
      try {
        if (!roomId) throw new Error("roomId is required");
        if (!content || !content.trim())
          throw new Error("Message content cannot be empty");

        //  Rate limit
        const ok = msgLimiter.allow(`user:${userId}`);
        if (!ok) throw new Error("Rate limit exceeded. Try again shortly.");

        // Ensure membership
        const membership = await prisma.roomMember.findUnique({
          where: { userId_roomId: { userId, roomId } },
        });
        if (!membership)
          throw new Error(`User ${userId} is not a member of room ${roomId}`);

        // Save the message
        const message = await prisma.message.create({
          data: { content: content.trim(), roomId, senderId: userId },
          include: {
            sender: { select: { id: true, username: true, email: true } },
          },
        });

        // Create delivery receipts for all room members except sender
        const members = await prisma.roomMember.findMany({
          where: { roomId },
          select: { userId: true },
        });

        const now = new Date();
        const ops = members
          .filter((m: { userId: number }) => m.userId !== userId)
          .map((m: { userId: any }) =>
            prisma.messageReceipt.upsert({
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
            }),
          );

        await prisma.$transaction(ops);

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
            .filter((m: { userId: number }) => m.userId !== userId)
            .map((m: { userId: any }) => m.userId),
          deliveredAt: now,
        });

        cb?.({ ok: true, message });
      } catch (e: any) {
        console.error("send_message error:", e);
        cb?.({ ok: false, error: e.message });
      }
    });

    // read_message: { roomId, messageIds: number[] }
    socket.on(
      "read_message",
      async (
        { roomId, messageIds }: { roomId: number; messageIds: number[] },
        cb?: Function,
      ) => {
        try {
          if (
            !roomId ||
            !Array.isArray(messageIds) ||
            messageIds.length === 0
          ) {
            throw new Error("roomId and messageIds are required");
          }

          // ensure membership
          const membership = await prisma.roomMember.findUnique({
            where: { userId_roomId: { userId, roomId } },
          });
          if (!membership) throw new Error("You are not a member of this room");

          const now = new Date();
          const ops = messageIds.map((id) =>
            prisma.messageReceipt.upsert({
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
            }),
          );
          await prisma.$transaction(ops);

          io.to(`room:${roomId}`).emit("read", {
            roomId,
            messageIds,
            userId,
            readAt: now,
          });

          cb?.({ ok: true });
        } catch (e: any) {
          cb?.({ ok: false, error: e.message });
        }
      },
    );

    socket.on("disconnect", async () => {
      const current = onlineCountByUser.get(userId) ?? 1;
      const next = Math.max(current - 1, 0);
      onlineCountByUser.set(userId, next);

      if (next === 0) {
        // mark last seen
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeen: new Date() },
        });
        io.emit("user_status", { userId, status: "offline" });
      }
    });

    (async () => {
      try {
        const memberships = await prisma.roomMember.findMany({
          where: { userId },
          select: { roomId: true },
        });
        memberships.forEach((m: { roomId: any }) =>
          socket.join(`room:${m.roomId}`),
        );
        console.log("User auto-joined rooms:", memberships);

        const prev = onlineCountByUser.get(userId) ?? 0;
        onlineCountByUser.set(userId, prev + 1);
        if (prev === 0) {
          io.emit("user_status", { userId, status: "online" });
        }
      } catch (err) {
        console.error("Error fetching memberships:", err);
      }
    })();
  });
}
