import prisma from "../../config/db";

export type PaginatedMessages = {
  items: Array<{
    id: number;
    content: string;
    createdAt: Date;
    sender: { id: number; username: string; email: string };
  }>;
  nextCursor: number | null;
};

class MessageService {
  async ensureUserInRoom(userId: number, roomId: number) {
    const membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!membership) throw new Error("You are not a member of this room");
  }

  async sendMessage(userId: number, roomId: number, content: string) {
    if (!content || !content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    await this.ensureUserInRoom(userId, roomId);

    const msg = await prisma.message.create({
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
  async getRoomMessages(
    userId: number,
    roomId: number,
    limit = 20,
    cursor?: number,
  ): Promise<PaginatedMessages> {
    await this.ensureUserInRoom(userId, roomId);

    const take = Math.min(Math.max(limit, 1), 100);

    const where = { roomId };
    const items = await prisma.message.findMany({
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

  async markRead(userId: number, messageIds: number[]) {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error("messageIds must be a non-empty array");
    }

    // Find messages, ensure user is member of their rooms
    const msgs = await prisma.message.findMany({
      where: { id: { in: messageIds } },
      select: { id: true, roomId: true },
    });
    if (msgs.length === 0) return { count: 0 };

    const roomIds = [...new Set(msgs.map((m: { roomId: any }) => m.roomId))];
    const memberships = await prisma.roomMember.findMany({
      where: { userId, roomId: { in: roomIds } },
      select: { roomId: true },
    });
    const memberRooms = new Set(
      memberships.map((m: { roomId: any }) => m.roomId),
    );
    const allowedIds = msgs
      .filter((m: { roomId: unknown }) => memberRooms.has(m.roomId))
      .map((m: { id: any }) => m.id);

    if (allowedIds.length === 0) return { count: 0 };

    // Upsert receipts as read
    const now = new Date();
    const ops = allowedIds.map((id: any) =>
      prisma.messageReceipt.upsert({
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
      }),
    );
    const results = await prisma.$transaction(ops);
    return { count: results.length };
  }
}

export default new MessageService();
