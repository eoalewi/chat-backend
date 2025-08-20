"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../config/db"));
class MessageService {
    async ensureUserInRoom(userId, roomId) {
        const membership = await db_1.default.roomMember.findUnique({
            where: { userId_roomId: { userId, roomId } },
        });
        if (!membership)
            throw new Error("You are not a member of this room");
    }
    async sendMessage(userId, roomId, content) {
        if (!content || !content.trim()) {
            throw new Error("Message content cannot be empty");
        }
        await this.ensureUserInRoom(userId, roomId);
        const msg = await db_1.default.message.create({
            data: { content: content.trim(), senderId: userId, roomId },
            include: {
                sender: { select: { id: true, username: true, email: true } },
            },
        });
        return msg;
    }
    /**
     * Cursor-based pagination:
     * - pass ?limit=20&cursor=123 where cursor is last message id user have seen
     * - returns messages ordered newest->oldest (descending by id)
     */
    async getRoomMessages(userId, roomId, limit = 20, cursor) {
        await this.ensureUserInRoom(userId, roomId);
        const take = Math.min(Math.max(limit, 1), 100);
        const where = { roomId };
        const items = await db_1.default.message.findMany({
            where,
            take,
            skip: cursor ? 1 : 0,
            ...(cursor ? { cursor: { id: cursor } } : {}),
            orderBy: { id: "desc" },
            include: {
                sender: { select: { id: true, username: true, email: true } },
            },
        });
        const lastItem = items.length > 0 ? items[items.length - 1] : null;
        const nextCursor = lastItem ? lastItem.id : null;
        return { items, nextCursor };
    }
    async markRead(userId, messageIds) {
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            throw new Error("messageIds must be a non-empty array");
        }
        // Find messages, ensure user is member of their rooms
        const msgs = await db_1.default.message.findMany({
            where: { id: { in: messageIds } },
            select: { id: true, roomId: true },
        });
        if (msgs.length === 0)
            return { count: 0 };
        const roomIds = [...new Set(msgs.map((m) => m.roomId))];
        const memberships = await db_1.default.roomMember.findMany({
            where: { userId, roomId: { in: roomIds } },
            select: { roomId: true },
        });
        const memberRooms = new Set(memberships.map((m) => m.roomId));
        const allowedIds = msgs
            .filter((m) => memberRooms.has(m.roomId))
            .map((m) => m.id);
        if (allowedIds.length === 0)
            return { count: 0 };
        // Upsert receipts as read
        const now = new Date();
        const ops = allowedIds.map((id) => db_1.default.messageReceipt.upsert({
            where: { messageId_userId: { messageId: id, userId } },
            update: { read: true, readAt: now, delivered: true, deliveredAt: now },
            create: {
                messageId: id,
                userId,
                read: true,
                readAt: now,
                delivered: true,
                deliveredAt: now,
            },
        }));
        const results = await db_1.default.$transaction(ops);
        return { count: results.length };
    }
}
exports.default = new MessageService();
//# sourceMappingURL=message.service.js.map