"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = __importDefault(require("./room.controller"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authMiddleware, (req, res) => room_controller_1.default.createRoom(req, res));
router.post("/join", authMiddleware_1.authMiddleware, (req, res) => room_controller_1.default.joinRoom(req, res));
router.get("/", authMiddleware_1.authMiddleware, (req, res) => room_controller_1.default.getMyRooms(req, res));
exports.default = router;
//# sourceMappingURL=room.routes.js.map