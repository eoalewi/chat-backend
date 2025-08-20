import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import messageController from "./message.controller";

const router = Router();

router.post("/", authMiddleware, (req, res) =>
  messageController.send(req, res),
);

router.get("/rooms/:roomId/messages", authMiddleware, (req, res) =>
  messageController.list(req, res),
);

router.post("/read", authMiddleware, (req, res) =>
  messageController.markRead(req, res),
);

export default router;
