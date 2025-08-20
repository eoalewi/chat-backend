import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import messageService from "./message.service";

class MessageController {
  async send(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { roomId, content } = req.body;

      if (!roomId)
        return res.status(400).json({ message: "roomId is required" });

      const msg = await messageService.sendMessage(
        userId,
        Number(roomId),
        content,
      );
      return res.status(201).json(msg);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const roomId = Number(req.params.roomId);
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

      if (Number.isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid roomId" });
      }

      const result = await messageService.getRoomMessages(
        userId,
        roomId,
        limit,
        cursor,
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async markRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const { messageIds } = req.body;
      const result = await messageService.markRead(userId, messageIds);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}

export default new MessageController();
