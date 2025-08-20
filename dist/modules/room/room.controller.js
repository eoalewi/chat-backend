"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_service_1 = __importDefault(require("./room.service"));
class RoomController {
    async createRoom(req, res) {
        try {
            const { name, isPrivate } = req.body;
            const userId = req.user.id;
            if (!name) {
                return res.status(400).json({ message: "Room name is required" });
            }
            const room = await room_service_1.default.createRoom(name, isPrivate || false, userId);
            return res.status(201).json(room);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async joinRoom(req, res) {
        try {
            const { roomId } = req.body;
            const userId = req.user.id;
            if (!roomId) {
                return res.status(400).json({ message: "Room ID is required" });
            }
            const member = await room_service_1.default.joinRoom(Number(roomId), userId);
            return res
                .status(200)
                .json({ message: "Joined room successfully", member });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    async getMyRooms(req, res) {
        try {
            const userId = req.user.id;
            const rooms = await room_service_1.default.getUserRooms(userId);
            return res.status(200).json(rooms);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}
exports.default = new RoomController();
//# sourceMappingURL=room.controller.js.map