import { FiCopy, FiLogOut, FiSend, FiUsers } from "react-icons/fi";

type RoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;

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
              10:00
            </p>
          </div>

          <div className="sm:border-l sm:border-[#242424] sm:pl-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#777]">
              Online users
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold text-green-500">
              <FiUsers />
              1/2
            </p>
          </div>

          <button
            type="button"
            className=" cursor-pointer ml-auto flex items-center gap-2 rounded hover:bg-red-400 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <FiLogOut />
            Leave room
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <p className="font-mono text-sm text-[#555]">
            Messages will appear here...
          </p>
        </div>

        <form className="flex gap-3 border-t border-[#242424] p-4 sm:p-5">
          <input
            type="text"
            aria-label="Message"
            placeholder="Type a message..."
            className="h-14 min-w-0 flex-1 rounded-sm border border-[#292929] bg-[#050505] px-5 font-mono text-sm outline-none placeholder:text-[#555]"
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
