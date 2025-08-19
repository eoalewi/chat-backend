import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get("/", (req, res) => res.send("Chat API Running 🚀"));

const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket events handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
