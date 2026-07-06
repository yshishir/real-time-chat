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

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    socket.on("create-room", () => {
      const roomCode = createRoomCode();
      socket.join(roomCode);

      console.log(`Room created: ${roomCode}`);
      console.log(`Socket ${socket.id} joined room ${roomCode}`);
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
