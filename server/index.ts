import { createServer } from "node:http";
import { Server } from "socket.io";
import { customAlphabet, nanoid } from "nanoid";

const createRoomCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);
const activeRooms = new Set<string>();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

function emitRoomUsers(roomCode: string) {
  const userCount = io.sockets.adapter.rooms.get(roomCode)?.size ?? 0;

  io.to(roomCode).emit("room-users", userCount);
}

const PORT = 4000;

io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);

  socket.on("create-room", (name: string, callback) => {
    let roomCode = createRoomCode();

    while (activeRooms.has(roomCode)) {
      roomCode = createRoomCode();
    }

    activeRooms.add(roomCode);
    socket.join(roomCode);
    emitRoomUsers(roomCode);
    socket.data.name = name;
    socket.data.roomCode = roomCode;
    console.log(`${name} created and joined room ${roomCode}`);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
    callback(roomCode);
  });

  socket.on("join-room", (roomCode: string, name: string, callback) => {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const roomExist = activeRooms.has(normalizedRoomCode);

    if (!roomExist) {
      callback({
        success: false,
        message: "Room not found",
      });
      return;
    }
    socket.join(normalizedRoomCode);
    emitRoomUsers(normalizedRoomCode);
    socket.data.name = name;
    socket.data.roomCode = normalizedRoomCode;

    callback({
      success: true,
      roomCode: normalizedRoomCode,
    });
    console.log(`${name} joined room ${normalizedRoomCode}`);
  });

  socket.on("send-message", (text: string, callback) => {
    const messageText = text.trim();
    const roomCode = socket.data.roomCode;
    const name = socket.data.name;

    if (!messageText || !roomCode || !name) {
      callback({
        success: false,
        message: "Unable to send message",
      });
      return;
    }

    if (!socket.rooms.has(roomCode)) {
      callback({
        success: false,
        message: "You are not in this room",
      });
      return;
    }

    const message = {
      id: nanoid(),
      text: messageText,
      sender: name,
      sentAt: new Date().toISOString(),
    };

    io.to(roomCode).emit("receive-message", message);

    callback({ success: true });
  });

  socket.on("leave-room", (callback) => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) {
      callback({ success: false });
      return;
    }

    socket.leave(roomCode);

    socket.data.roomCode = undefined;
    socket.data.name = undefined;

    emitRoomUsers(roomCode);

    callback({ success: true });
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      emitRoomUsers(roomCode);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
  socket.on("get-room-users", (roomCode: string, callback) => {
    const userCount = io.sockets.adapter.rooms.get(roomCode)?.size ?? 0;
    callback(userCount);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
