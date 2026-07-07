import { createServer } from "node:http";
import { Server } from "socket.io";
import { customAlphabet } from "nanoid";

const createRoomCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const PORT = 4000;

io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);

  socket.on("create-room", (name: string, callback) => {
    const roomCode = createRoomCode();
    socket.join(roomCode);
    socket.data.name = name;
    socket.data.roomCode = roomCode;
    console.log(`${name} created and joined room ${roomCode}`);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
    callback(roomCode);
  });

  socket.on("join-room", (roomCode: string, name: string, callback) => {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const roomExist = io.sockets.adapter.rooms.has(normalizedRoomCode);

    if (!roomExist) {
      callback({
        success: false,
        message: "Room not found",
      });
      return;
    }
    socket.join(normalizedRoomCode);
    socket.data.name = name;
    socket.data.roomCode = normalizedRoomCode;

    callback({
      success: true,
      roomCode: normalizedRoomCode,
    });
    console.log(`${name} joined room ${normalizedRoomCode}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
