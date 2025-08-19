import { Response } from "express";
import roomService from "./room.service";
import { AuthRequest } from "../../middlewares/authMiddleware";

class RoomController {
  async createRoom(req: AuthRequest, res: Response) {
    try {
      const { name, isPrivate } = req.body;
      const userId = req.user.id;

      if (!name) {
        return res.status(400).json({ message: "Room name is required" });
      }

      const room = await roomService.createRoom(name, isPrivate || false, userId);
      return res.status(201).json(room);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async joinRoom(req: AuthRequest, res: Response) {
    try {
      const { roomId } = req.body;
      const userId = req.user.id;

      if (!roomId) {
        return res.status(400).json({ message: "Room ID is required" });
      }

      const member = await roomService.joinRoom(Number(roomId), userId);
      return res.status(200).json({ message: "Joined room successfully", member });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getMyRooms(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const rooms = await roomService.getUserRooms(userId);
      return res.status(200).json(rooms);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new RoomController();
