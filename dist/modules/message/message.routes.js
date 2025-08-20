"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const message_controller_1 = __importDefault(require("./message.controller"));
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authMiddleware, (req, res) => message_controller_1.default.send(req, res));
router.get("/rooms/:roomId/messages", authMiddleware_1.authMiddleware, (req, res) => message_controller_1.default.list(req, res));
router.post("/read", authMiddleware_1.authMiddleware, (req, res) => message_controller_1.default.markRead(req, res));
exports.default = router;
//# sourceMappingURL=message.routes.js.map