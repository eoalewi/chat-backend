"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_service_1 = __importDefault(require("./message.service"));
class MessageController {
    async send(req, res) {
        try {
            const userId = req.user.id;
            const { roomId, content } = req.body;
            if (!roomId)
                return res.status(400).json({ message: "roomId is required" });
            const msg = await message_service_1.default.sendMessage(userId, Number(roomId), content);
            return res.status(201).json(msg);
        }
        catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }
    async list(req, res) {
        try {
            const userId = req.user.id;
            const roomId = Number(req.params.roomId);
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
            if (Number.isNaN(roomId)) {
                return res.status(400).json({ message: "Invalid roomId" });
            }
            const result = await message_service_1.default.getRoomMessages(userId, roomId, limit, cursor);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }
    async markRead(req, res) {
        try {
            const userId = req.user.id;
            const { messageIds } = req.body;
            const result = await message_service_1.default.markRead(userId, messageIds);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }
}
exports.default = new MessageController();
//# sourceMappingURL=message.controller.js.map