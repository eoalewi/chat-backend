import { Router } from "express";
import roomController from "./room.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, (req, res) =>
  roomController.createRoom(req, res),
);
router.post("/join", authMiddleware, (req, res) =>
  roomController.joinRoom(req, res),
);
router.get("/", authMiddleware, (req, res) =>
  roomController.getMyRooms(req, res),
);

export default router;
