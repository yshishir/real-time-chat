"use client";

import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { FiCopy, FiLogOut, FiSend, FiUsers } from "react-icons/fi";
import { socket } from "@/lib/socket";

type JoinRoomResponse = {
  success: boolean;
  roomCode?: string;
  message?: string;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  sentAt: string;
};

type SendMessageResponse = {
  success: boolean;
  message?: string;
};

type RoomExpirationResponse = {
  success: boolean;
  expiresAt?: number;
  message?: string;
};

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(600);

  useEffect(() => {
    const name = sessionStorage.getItem("chatName");
    const storedRoomCode = sessionStorage.getItem("roomCode");
    let countdownInterval: ReturnType<typeof setInterval> | undefined;

    if (!name || storedRoomCode !== roomId) {
      router.replace("/");
      return;
    }

    function handleConnect() {
      socket.emit("join-room", roomId, name, (response: JoinRoomResponse) => {
        if (!response.success) {
          sessionStorage.removeItem("chatName");
          sessionStorage.removeItem("roomCode");
          requestRoomExpiration();
          router.replace("/");
          return;
        }

        console.log(`Rejoined room: ${response.roomCode}`);
      });
    }

    function startCountdown(expiresAt: number) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      function updateCountdown() {
        const secondsRemaining = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000),
        );

        setTimeRemaining(secondsRemaining);
      }

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }

    function requestRoomExpiration() {
      socket.emit(
        "get-room-expiration",
        roomId,
        (response: RoomExpirationResponse) => {
          if (!response.success || !response.expiresAt) {
            router.replace("/");
            return;
          }

          startCountdown(response.expiresAt);
        },
      );
    }

    function handleRoomExpired() {
      sessionStorage.removeItem("chatName");
      sessionStorage.removeItem("roomCode");
      router.replace("/");
    }
    function handleRoomUsers(userCount: number) {
      setOnlineUsers(userCount);
    }

    function handleReceiveMessage(newMessage: ChatMessage) {
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    }

    socket.on("receive-message", handleReceiveMessage);

    socket.on("room-users", handleRoomUsers);

    if (socket.connected) {
      requestRoomExpiration();
      socket.emit("get-room-users", roomId, (userCount: number) => {
        setOnlineUsers(userCount);
      });
    }

    socket.on("connect", handleConnect);
    socket.on("room-expired", handleRoomExpired);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("connect", handleConnect);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("room-expired", handleRoomExpired);

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [roomId, router]);

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    socket.emit(
      "send-message",
      trimmedMessage,
      (response: SendMessageResponse) => {
        if (!response.success) {
          console.log(response.message);
          return;
        }

        setMessage("");
      },
    );
  }

  function handleLeaveRoom() {
    socket.emit("leave-room", (response: { success: boolean }) => {
      if (!response.success) {
        return;
      }

      sessionStorage.removeItem("chatName");
      sessionStorage.removeItem("roomCode");

      router.push("/");
    });
  }
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = String(timeRemaining % 60).padStart(2, "0");

  return (
    <main className="flex min-h-screen bg-[#080808] p-3 text-white sm:p-5">
      <section className="flex min-h-[calc(100vh-24px)] w-full flex-col rounded-md border border-[#292929] bg-[#0b0b0b] sm:min-h-[calc(100vh-40px)]">
        <header className="flex flex-wrap items-center gap-6 border-b border-[#242424] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#777]">
              Room code
            </p>
            <div className="mt-1 flex items-center gap-3">
              <p className="font-mono text-lg font-semibold text-green-500">
                {roomId}
              </p>
              <button
                type="button"
                aria-label="Copy room code"
                className=" cursor-pointer flex items-center gap-2 rounded bg-[#242424] px-3 py-2 text-xs font-medium text-[#aaa]"
              >
                <FiCopy />
                Copy
              </button>
            </div>
          </div>

          <div className="sm:border-l sm:border-[#242424] sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#777]">
              Time remaining
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-rose-500">
              {minutes}:{seconds}
            </p>
          </div>

          <div className="sm:border-l sm:border-[#242424] sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#777]">
              Online users
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold text-green-500">
              <FiUsers />
              {onlineUsers}
            </p>
          </div>

          <button
            type="button"
            className=" cursor-pointer ml-auto flex items-center gap-2 rounded hover:bg-red-400 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={handleLeaveRoom}
          >
            <FiLogOut />
            Leave room
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {messages.length === 0 ? (
            <p className="font-mono text-sm text-[#555]">
              Messages will appear here...
            </p>
          ) : (
            messages.map((chatMessage) => (
              <p key={chatMessage.id} className="font-mono text-sm">
                {chatMessage.sender}: {chatMessage.text}
              </p>
            ))
          )}
        </div>

        <form
          className="flex gap-3 border-t border-[#242424] p-4 sm:p-5"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            aria-label="Message"
            placeholder="Type a message..."
            className="h-14 min-w-0 flex-1 rounded-sm border border-[#292929] bg-[#050505] px-5 font-mono text-sm outline-none placeholder:text-[#555]"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            type="submit"
            className="flex cursor-pointer h-14 items-center justify-center gap-2 rounded-sm bg-[#f4f4f5] px-5 font-semibold text-[#18181b] sm:px-8"
          >
            <FiSend />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </main>
  );
}
