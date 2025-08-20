import prisma from "../../config/db";

class RoomService {
  async createRoom(name: string, isPrivate: boolean, userId: number) {
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
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");

    let membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (!membership) {
      membership = await prisma.roomMember.create({
        data: { roomId, userId },
      });
    }

    return membership;
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
