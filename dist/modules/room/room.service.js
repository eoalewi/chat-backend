"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../config/db"));
class RoomService {
    async createRoom(name, isPrivate, userId) {
        const room = await db_1.default.room.create({
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
    async joinRoom(roomId, userId) {
        const room = await db_1.default.room.findUnique({ where: { id: roomId } });
        if (!room)
            throw new Error("Room not found");
        let membership = await db_1.default.roomMember.findUnique({
            where: { userId_roomId: { userId, roomId } },
        });
        if (!membership) {
            membership = await db_1.default.roomMember.create({
                data: { roomId, userId },
            });
        }
        return membership;
    }
    async getUserRooms(userId) {
        const rooms = await db_1.default.roomMember.findMany({
            where: { userId },
            include: { room: true },
        });
        return rooms.map((r) => r.room);
    }
}
exports.default = new RoomService();
//# sourceMappingURL=room.service.js.map