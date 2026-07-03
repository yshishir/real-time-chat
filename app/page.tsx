export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white font-mono">
      <button
        type="button"
        aria-label="Dark theme"
        className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-md border border-[#292929]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"
          />
        </svg>
      </button>

      <section className="w-full max-w-[800px] rounded-2xl border border-[#292929] p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-7 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.4 9.4 0 0 1-4-.9L3 21l1.7-4.4A8.4 8.4 0 1 1 21 11.5Z"
            />
          </svg>
          <h1 className="text-2xl font-semibold sm:text-3xl">Real Time Chat</h1>
        </div>

        <p className="mt-1 text-sm text-[#9f9f9f] sm:text-base">
          temporary room that expires after all users exit
        </p>

        <div className="mt-8 space-y-5">
          <button
            type="button"
            className="h-[60px] w-full rounded-md bg-[#f4f4f5] text-lg font-medium text-[#18181b] sm:text-xl"
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
              className="h-[52px] rounded-md bg-[#f4f4f5] px-10 text-base font-medium text-[#18181b]"
            >
              Join Room
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
