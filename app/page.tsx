"use client";
import { useEffect, useRef } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`Connected with ID: ${socket.id}`);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  function handleCreateRoom() {
    socketRef.current?.emit("create-room", (roomCode: string) => {
      console.log(`Created room: ${roomCode}`);
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white font-mono">
      <section className="w-full max-w-[700px] rounded-md border border-[#292929] p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <FiMessageCircle size={25} />
          <h1 className="text-2xl font-semibold sm:text-3xl">Real Time Chat</h1>
        </div>

        <p className="mt-1 text-sm text-[#9f9f9f] sm:text-base">
          temporary chat room that expires after all users exit
        </p>

        <div className="mt-8 space-y-5">
          <button
            type="button"
            className="h-[60px] w-full rounded-md bg-[#f4f4f5] hover:bg-[#f4f4f5]/95 text-lg font-medium text-[#18181b] sm:text-xl cursor-pointer"
            onClick={handleCreateRoom}
          >
            Create New Room
          </button>

          <input
            type="text"
            placeholder="Enter your name"
            aria-label="Your name"
            className="h-[52px] w-full rounded-md border border-[#292929] bg-transparent px-4 text-base outline-none placeholder:text-[#929292]"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Enter Room Code"
              aria-label="Room code"
              className="h-[52px] min-w-0 flex-1 rounded-md border border-[#292929] bg-transparent px-4 text-base outline-none placeholder:text-[#929292]"
            />
            <button
              type="button"
              className="h-[52px] rounded-md bg-[#f4f4f5] hover:bg-[#f4f4f5]/95 px-10 text-base font-medium text-[#18181b] cursor-pointer"
            >
              Join Room
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
