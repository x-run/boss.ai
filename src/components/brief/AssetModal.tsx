import { useState, useEffect, useRef, useCallback } from "react";

/* ── Types ── */

export interface AssetForm {
  assets_url: string;
  bgm_url: string;
  logo_url: string;
  thumb_url: string;
  font_note: string;
}

interface AssetModalProps {
  isOpen: boolean;
  initialValue: AssetForm;
  onClose: () => void;
  onSave: (value: AssetForm) => void;
}

/* ── Constants ── */

const URL_RE = /^https?:\/\/.+/;

const FIELDS: {
  key: keyof AssetForm;
  label: string;
  placeholder: string;
  isUrl: boolean;
}[] = [
  {
    key: "assets_url",
    label: "素材共有リンク",
    placeholder: "https://drive.google.com/...",
    isUrl: true,
  },
  {
    key: "bgm_url",
    label: "BGM候補リンク",
    placeholder: "https://...",
    isUrl: true,
  },
  {
    key: "logo_url",
    label: "ロゴ素材URL",
    placeholder: "https://...",
    isUrl: true,
  },
  {
    key: "thumb_url",
    label: "サムネイル素材URL",
    placeholder: "https://...",
    isUrl: true,
  },
  {
    key: "font_note",
    label: "フォント指定",
    placeholder: "例：Noto Sans JP Bold",
    isUrl: false,
  },
];

/* ── Component ── */

export default function AssetModal({
  isOpen,
  initialValue,
  onClose,
  onSave,
}: AssetModalProps) {
  const [form, setForm] = useState<AssetForm>({ ...initialValue });
  const [errors, setErrors] = useState<Partial<Record<keyof AssetForm, string>>>({});

  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  /* ── reset form when opened ── */
  useEffect(() => {
    if (isOpen) {
      setForm({ ...initialValue });
      setErrors({});
      // focus first input after mount
      requestAnimationFrame(() => firstInputRef.current?.focus());
    }
  }, [isOpen, initialValue]);

  /* ── ESC to close ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* ── focus trap ── */
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  /* ── save handler ── */
  const handleSave = useCallback(() => {
    const errs: Partial<Record<keyof AssetForm, string>> = {};
    let valid = true;

    for (const f of FIELDS) {
      if (!f.isUrl) continue;
      const v = form[f.key].trim();
      if (v && !URL_RE.test(v)) {
        errs[f.key] = "http:// または https:// で始まるURLを入力してください";
        valid = false;
      }
    }

    if (!valid) {
      setErrors(errs);
      return;
    }

    const trimmed: AssetForm = {
      assets_url: form.assets_url.trim(),
      bgm_url: form.bgm_url.trim(),
      logo_url: form.logo_url.trim(),
      thumb_url: form.thumb_url.trim(),
      font_note: form.font_note.trim(),
    };
    onSave(trimmed);
    onClose();
  }, [form, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm
                   animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />

      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md
                   bg-[#0c0c0c]/95 backdrop-blur-2xl
                   border border-white/[0.08]
                   rounded-2xl shadow-2xl shadow-black/60
                   overflow-hidden
                   animate-[modalIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.05]">
          <div>
            <h3 className="text-sm font-semibold">素材を追加</h3>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              URLは https:// から入力してください
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
                       text-neutral-600 hover:text-white hover:bg-white/[0.06]
                       transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* form */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {FIELDS.map((f, i) => (
            <div key={f.key}>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                {f.label}
              </label>
              <input
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                value={form[f.key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className={`w-full px-3.5 py-2.5 rounded-xl text-[13px]
                           bg-white/[0.035] border text-white placeholder-neutral-700
                           focus:outline-none focus:border-emerald-500/40
                           focus:ring-1 focus:ring-emerald-500/20
                           transition
                           ${errors[f.key] ? "border-red-500/40" : "border-white/[0.07]"}`}
              />
              {errors[f.key] && (
                <p className="text-[11px] text-red-400 mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] text-neutral-500
                       hover:text-white transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-[13px] font-semibold
                       bg-white text-black hover:shadow-lg
                       active:scale-[0.97] transition-all"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
