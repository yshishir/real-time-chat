import { createServer } from "node:http";
import { Server } from "socket.io";
import { customAlphabet, nanoid } from "nanoid";

const createRoomCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);
type ChatRoom = {
  expiresAt: number;
  expirationTimer: ReturnType<typeof setTimeout>;
};

const activeRooms = new Map<string, ChatRoom>();
const ROOM_DURATION_MS = 15 * 60 * 1000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

const roomDeletionTimers = new Map<string, ReturnType<typeof setTimeout>>();

function emitRoomUsers(roomCode: string) {
  const userCount = io.sockets.adapter.rooms.get(roomCode)?.size ?? 0;

  io.to(roomCode).emit("room-users", userCount);
}

function scheduleRoomDeletion(roomCode: string) {
  const existingTimer = roomDeletionTimers.get(roomCode);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    const userCount = io.sockets.adapter.rooms.get(roomCode)?.size ?? 0;

    if (userCount === 0) {
      const room = activeRooms.get(roomCode);

      if (room) {
        clearTimeout(room.expirationTimer);
        activeRooms.delete(roomCode);
      }
      console.log(`Room Deleted: ${roomCode}`);
    }
    roomDeletionTimers.delete(roomCode);
  }, 5000);
  roomDeletionTimers.set(roomCode, timer);
}

const PORT = Number(process.env.PORT) || 4000;

io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);

  socket.on("create-room", (name: string, callback) => {
    let roomCode = createRoomCode();

    while (activeRooms.has(roomCode)) {
      roomCode = createRoomCode();
    }

    registerRoom(roomCode);
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
    scheduleRoomDeletion(roomCode);

    socket.data.roomCode = undefined;
    socket.data.name = undefined;

    emitRoomUsers(roomCode);

    callback({ success: true });
  });
  socket.on("get-room-expiration", (roomCode: string, callback) => {
    const room = activeRooms.get(roomCode);

    if (!room) {
      callback({
        success: false,
        message: "Room not found",
      });
      return;
    }

    callback({
      success: true,
      expiresAt: room.expiresAt,
    });
  });
  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      emitRoomUsers(roomCode);
      scheduleRoomDeletion(roomCode);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
  socket.on("get-room-users", (roomCode: string, callback) => {
    const userCount = io.sockets.adapter.rooms.get(roomCode)?.size ?? 0;
    callback(userCount);
  });
});

function registerRoom(roomCode: string) {
  const expiresAt = Date.now() + ROOM_DURATION_MS;

  const expirationTimer = setTimeout(async () => {
    io.to(roomCode).emit("room-expired");

    const roomSockets = await io.in(roomCode).fetchSockets();

    for (const roomSocket of roomSockets) {
      roomSocket.data.name = undefined;
      roomSocket.data.roomCode = undefined;
      roomSocket.leave(roomCode);
    }

    activeRooms.delete(roomCode);
    roomDeletionTimers.delete(roomCode);

    console.log(`Room expired: ${roomCode}`);
  }, ROOM_DURATION_MS);

  activeRooms.set(roomCode, {
    expiresAt,
    expirationTimer,
  });
}

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
