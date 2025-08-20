"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const room_routes_1 = __importDefault(require("./modules/room/room.routes"));
const message_routes_1 = __importDefault(require("./modules/message/message.routes"));
const socketHandler_1 = require("./socket/socketHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/auth", auth_routes_1.default);
app.use("/rooms", room_routes_1.default);
app.use("/messages", message_routes_1.default);
app.get("/", (req, res) => res.send("Chat API Running"));
const server = http_1.default.createServer(app);
// Socket.io setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
(0, socketHandler_1.setupSocket)(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map