import type { Message } from "../../types/brief";

interface Props {
  message: Message;
  /** Optional slot rendered below the AI bubble (for OptionChips etc.) */
  children?: React.ReactNode;
}

export default function ChatMessage({ message, children }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-5 animate-msg-in">
        <div
          className="inline-block max-w-sm px-4 py-3
                     bg-emerald-500/[0.10] border border-emerald-500/[0.13]
                     rounded-2xl rounded-tr-md"
        >
          <p className="text-[14px] text-emerald-100 leading-[1.7]">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  /* ── AI message ── */
  return (
    <div className="flex gap-3 mb-5 animate-msg-in">
      {/* avatar */}
      <div
        className="w-7 h-7 rounded-lg bg-emerald-500/10
                    flex items-center justify-center shrink-0 mt-0.5"
      >
        <span className="text-emerald-400 text-[10px] font-bold font-mono">
          AI
        </span>
      </div>

      <div className="min-w-0 flex-1">
        {/* bubble */}
        <div
          className="inline-block max-w-lg px-4 py-3
                     bg-white/[0.035] border border-white/[0.06]
                     rounded-2xl rounded-tl-md"
        >
          <p className="text-[14px] text-neutral-300 leading-[1.75] whitespace-pre-line">
            {message.text}
          </p>
        </div>

        {/* slot for options / chips (rendered by parent) */}
        {children}
      </div>
    </div>
  );
}
