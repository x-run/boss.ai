import { useState } from "react";

/* ── Types ── */

export type Option = { label: string; value: string };

export interface OptionChipsProps {
  multi: boolean;
  options: Option[];
  selected?: string[];
  onPickSingle?: (value: string, label: string) => void;
  onToggleMulti?: (value: string) => void;
  onConfirmMulti?: () => void;
  confirmDisabled?: boolean;
  customType?: "duration" | "target" | null;
  onSubmitCustomDuration?: (seconds: number) => void;
  onSubmitOtherTarget?: (text: string) => void;
}

/* ── Shared styles ── */

const CHIP_BASE =
  "inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full text-[13px] font-medium border cursor-pointer " +
  "transition-[transform,background,border-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] " +
  "hover:-translate-y-0.5 active:scale-95 active:translate-y-0 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-1 focus:ring-offset-[#050505]";

const CHIP_NORMAL =
  "bg-white/[0.025] border-white/[0.07] text-neutral-400 " +
  "hover:bg-white/[0.07] hover:border-white/[0.14] hover:text-white hover:shadow-lg hover:shadow-white/[0.02]";

const CHIP_SELECTED =
  "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10";

const CHIP_DASHED =
  "px-4 py-[9px] rounded-full text-[13px] font-medium border border-dashed " +
  "bg-white/[0.015] border-white/[0.07] text-neutral-500 " +
  "hover:bg-white/[0.06] hover:border-white/[0.14] hover:text-white " +
  "hover:-translate-y-0.5 active:scale-95 active:translate-y-0 " +
  "transition-[transform,background,border-color,color] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-1 focus:ring-offset-[#050505]";

const CUSTOM_INPUT =
  "px-3 py-[7px] rounded-full text-[13px] bg-white/[0.04] border border-white/[0.1] " +
  "text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/40";

const CUSTOM_BTN =
  "px-3 py-[7px] rounded-full text-[12px] font-semibold " +
  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 " +
  "hover:bg-emerald-500/30 transition-colors";

/* ── Check icon ── */

function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/* ── Component ── */

export default function OptionChips({
  multi,
  options,
  selected = [],
  onPickSingle,
  onToggleMulti,
  onConfirmMulti,
  confirmDisabled = true,
  customType,
  onSubmitCustomDuration,
  onSubmitOtherTarget,
}: OptionChipsProps) {
  /* custom input open/value state lives here */
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleCustomSubmit = () => {
    const v = customValue.trim();
    if (!v) return;

    if (customType === "duration" && onSubmitCustomDuration) {
      onSubmitCustomDuration(Number(v));
    } else if (customType === "target" && onSubmitOtherTarget) {
      onSubmitOtherTarget(v);
    }
    setCustomValue("");
    setCustomOpen(false);
  };

  return (
    <div className="mt-3 max-w-lg">
      <div className="flex flex-wrap gap-2">
        {/* ── option chips ── */}
        {options.map((opt) => {
          const isSelected = multi && selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() =>
                multi
                  ? onToggleMulti?.(opt.value)
                  : onPickSingle?.(opt.value, opt.label)
              }
              className={`${CHIP_BASE} ${isSelected ? CHIP_SELECTED : CHIP_NORMAL}`}
            >
              {isSelected && <CheckIcon />}
              <span>{opt.label}</span>
            </button>
          );
        })}

        {/* ── custom: duration ── */}
        {customType === "duration" && (
          <>
            {!customOpen ? (
              <button
                onClick={() => setCustomOpen(true)}
                className={CHIP_DASHED}
              >
                カスタム
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                  placeholder="秒"
                  autoFocus
                  className={`w-[72px] ${CUSTOM_INPUT}`}
                />
                <button onClick={handleCustomSubmit} className={CUSTOM_BTN}>
                  決定
                </button>
              </span>
            )}
          </>
        )}

        {/* ── custom: target ── */}
        {customType === "target" && (
          <>
            {!customOpen ? (
              <button
                onClick={() => setCustomOpen(true)}
                className={CHIP_DASHED}
              >
                その他
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                  placeholder="ターゲットを入力"
                  autoFocus
                  className={`w-[140px] ${CUSTOM_INPUT}`}
                />
                <button onClick={handleCustomSubmit} className={CUSTOM_BTN}>
                  決定
                </button>
              </span>
            )}
          </>
        )}
      </div>

      {/* ── multi confirm button ── */}
      {multi && (
        <div className="mt-3">
          <button
            onClick={onConfirmMulti}
            disabled={confirmDisabled}
            className={`inline-flex items-center gap-2 px-5 py-[9px] rounded-full text-[13px] font-semibold border
              transition-[transform,background,box-shadow,color] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              hover:-translate-y-0.5 active:scale-95 active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-1 focus:ring-offset-[#050505]
              ${
                !confirmDisabled
                  ? "bg-white text-black border-white hover:shadow-lg hover:shadow-white/[0.08]"
                  : "bg-white/[0.025] text-neutral-700 border-white/[0.05] cursor-not-allowed"
              }`}
          >
            <span>
              {!confirmDisabled
                ? `${selected.length}件選択中 — 確定する`
                : "トーンを選択してください"}
            </span>
            {!confirmDisabled && (
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
