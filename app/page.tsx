"use client";
import { useEffect, useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

type JoinRoomResponse = {
  success: boolean;
  roomCode?: string;
  message?: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  useEffect(() => {
    let noticeTimer: ReturnType<typeof setTimeout> | undefined;

    if (sessionStorage.getItem("roomClosed")) {
      sessionStorage.removeItem("roomClosed");
      noticeTimer = setTimeout(() => {
        setNotice("Room closed because the timer ended");
      }, 0);
    }
    function handleConnect() {
      console.log(`Connected with ID: ${socket.id}`);
    }

    socket.on("connect", handleConnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      if (noticeTimer) clearTimeout(noticeTimer);
    };
  }, []);

  function handleCreateRoom() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Enter your name");
      return;
    }
    socket.emit("create-room", trimmedName, (roomCode: string) => {
      sessionStorage.setItem("chatName", trimmedName);
      sessionStorage.setItem("roomCode", roomCode);
      router.push(`/room/${roomCode}`);
    });
  }

  function handleJoinRoom() {
    const trimmedName = name.trim();
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    if (!trimmedName || !normalizedRoomCode) {
      setError(!trimmedName ? "Enter your name" : "Enter a room code");
      return;
    }
    socket.emit(
      "join-room",
      normalizedRoomCode,
      trimmedName,
      (response: JoinRoomResponse) => {
        if (!response.success) {
          setError(response.message ?? "Unable to join room");
          return;
        }
        sessionStorage.setItem("chatName", trimmedName);
        sessionStorage.setItem("roomCode", response.roomCode!);
        router.push(`/room/${response.roomCode}`);
      },
    );
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white font-mono">
      <section className="w-full max-w-[700px] rounded-md border border-[#292929] p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <FiMessageCircle size={25} />
          <h1 className="text-2xl font-semibold sm:text-3xl">Real Time Chat</h1>
        </div>

        <p className="mt-1 text-sm text-[#9f9f9f] sm:text-base">
          temporary chat room that expires after 15 minutes or when everyone leaves
        </p>

        {notice && <p className="mt-3 text-sm text-red-500">{notice}</p>}

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
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Enter Room Code"
              aria-label="Room code"
              className="h-[52px] min-w-0 flex-1 rounded-md border border-[#292929] bg-transparent px-4 text-base outline-none placeholder:text-[#929292]"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
            />
            <button
              type="button"
              className="h-[52px] rounded-md bg-[#f4f4f5] hover:bg-[#f4f4f5]/95 px-10 text-base font-medium text-[#18181b] cursor-pointer"
              onClick={handleJoinRoom}
            >
              Join Room
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
