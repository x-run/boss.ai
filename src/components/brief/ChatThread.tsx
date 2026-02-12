import { useRef, useState, useEffect, useCallback } from "react";
import type { Message, AiOptionsMessage } from "../../types/brief";
import ChatMessage from "./ChatMessage";
import OptionChips from "./OptionChips";

/* ── Types ── */

interface ChatThreadProps {
  messages: Message[];
  typing: boolean;
  pendingTones: string[];
  onPickSingle: (msgId: string, value: string, label: string) => void;
  onToggleTone: (value: string) => void;
  onConfirmTones: (msgId: string) => void;
  onSubmitCustomDuration: (msgId: string, seconds: number) => void;
  onSubmitOtherTarget: (msgId: string, text: string) => void;
}

/* ── Component ── */

export default function ChatThread({
  messages,
  typing,
  pendingTones,
  onPickSingle,
  onToggleTone,
  onConfirmTones,
  onSubmitCustomDuration,
  onSubmitOtherTarget,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Track "near bottom" with a ref (for scroll decision)
     and state (for button visibility) */
  const nearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  /* ── scroll position check ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const near =
      el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
    nearBottomRef.current = near;
    setShowScrollBtn(!near);
  }, []);

  /* ── auto-scroll on new content ── */
  useEffect(() => {
    if (nearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  /* ── manual scroll-to-bottom ── */
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    nearBottomRef.current = true;
    setShowScrollBtn(false);
  }, []);

  return (
    <div className="relative flex-1 min-h-0">
      {/* scrollable area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-4 sm:px-6 py-6"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* ── messages ── */}
          {messages.map((msg) => {
            const opts =
              msg.role === "ai" && msg.type === "options"
                ? (msg as AiOptionsMessage)
                : null;

            return (
              <ChatMessage key={msg.id} message={msg}>
                {opts && !opts.answered && (
                  <OptionChips
                    multi={opts.multi}
                    options={opts.options ?? []}
                    selected={pendingTones}
                    onPickSingle={(v, l) => onPickSingle(msg.id, v, l)}
                    onToggleMulti={onToggleTone}
                    onConfirmMulti={() => onConfirmTones(msg.id)}
                    confirmDisabled={pendingTones.length === 0}
                    customType={opts.customInput ?? null}
                    onSubmitCustomDuration={(s) =>
                      onSubmitCustomDuration(msg.id, s)
                    }
                    onSubmitOtherTarget={(t) =>
                      onSubmitOtherTarget(msg.id, t)
                    }
                  />
                )}
              </ChatMessage>
            );
          })}

          {/* ── typing indicator ── */}
          {typing && (
            <div className="flex gap-3 animate-msg-in">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="text-emerald-400 text-[10px] font-bold font-mono">
                  AI
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/[0.035] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                <span className="w-[5px] h-[5px] rounded-full bg-neutral-500 animate-bounce" />
                <span
                  className="w-[5px] h-[5px] rounded-full bg-neutral-500 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-[5px] h-[5px] rounded-full bg-neutral-500 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          )}

          {/* spacer – prevents last message from hiding behind composer */}
          <div ref={bottomRef} className="h-24" />
        </div>
      </div>

      {/* ── scroll-to-bottom button ── */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                     flex items-center gap-1.5 px-4 py-2 rounded-full
                     bg-neutral-900/90 border border-white/[0.1]
                     text-[12px] text-neutral-400 hover:text-white
                     shadow-lg shadow-black/30 backdrop-blur-sm
                     transition-all duration-200 hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          最新へ
        </button>
      )}
    </div>
  );
}
