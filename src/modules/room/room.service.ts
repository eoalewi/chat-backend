import prisma from "../../config/db";

class RoomService {
  async createRoom(name: string, isPrivate: boolean, userId: number) {
    // Create room and add creator as member
    const room = await prisma.room.create({
      data: {
        name,
        isPrivate,
        members: {
          create: {
            userId,
          },
        },
      },
      include: { members: true },
    });

    return room;
  }

  async joinRoom(roomId: number, userId: number) {
    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");

    // Check if already a member
    const existing = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (existing) throw new Error("Already joined this room");

    // Add user as member
    const member = await prisma.roomMember.create({
      data: { roomId, userId },
    });

    return member;
  }

  async getUserRooms(userId: number) {
    const rooms = await prisma.roomMember.findMany({
      where: { userId },
      include: { room: true },
    });

   return rooms.map((r: { room: any }) => r.room);

  }
}

export default new RoomService();

