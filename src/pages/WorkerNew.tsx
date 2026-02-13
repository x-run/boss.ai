import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  createWorker,
  checkWorkerReadiness,
  getWorkerByOwnerUserId,
  PLATFORMS,
  TOOLS,
  STRENGTHS,
  TIMEZONES,
  type PlatformTag,
  type ToolTag,
  type StrengthTag,
  type WorkerStatus,
} from "../lib/workers";
import { loadSession } from "../lib/auth";

/* ── Step definitions ── */

const STEP_LABELS = ["Profile", "Capability", "Portfolio", "Review"] as const;
type Step = 0 | 1 | 2 | 3;

/* ── Form state ── */

interface FormState {
  name: string;
  status: WorkerStatus;
  timezone: string;
  headline: string;
  platforms: PlatformTag[];
  tools: ToolTag[];
  strengths: StrengthTag[];
  portfolioUrls: string[];
}

const INITIAL: FormState = {
  name: "",
  status: "available",
  timezone: "Asia/Tokyo",
  headline: "",
  platforms: [],
  tools: [],
  strengths: [],
  portfolioUrls: [],
};

/* ── Status config ── */

const STATUS_OPTIONS: { value: WorkerStatus; label: string; cls: string }[] = [
  { value: "available", label: "Available", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { value: "busy", label: "Busy", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { value: "offline", label: "Offline", cls: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30" },
];

const STATUS_PILL: Record<WorkerStatus, string> = {
  available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  busy: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  offline: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

/* ── Validation ── */

function canProceed(step: Step, form: FormState): boolean {
  switch (step) {
    case 0:
      return form.name.trim().length > 0;
    case 1:
      return (
        form.platforms.length > 0 &&
        form.tools.length > 0 &&
        form.strengths.length > 0
      );
    case 2:
      return true; // optional
    case 3:
      return true;
  }
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/* ── Chip component ── */

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border
                  transition-all duration-200 cursor-pointer select-none
                  hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]
                  active:scale-[0.97]
                  ${
                    selected
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.12)]"
                      : "bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:border-white/[0.16] hover:text-neutral-200"
                  }`}
    >
      {selected && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {label}
    </button>
  );
}

/* ── Main component ── */

export default function WorkerNew() {
  const nav = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [toast, setToast] = useState(false);

  /* step transition direction for animation */
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);

  const goStep = useCallback(
    (next: Step) => {
      setDirection(next > step ? "next" : "prev");
      setAnimKey((k) => k + 1);
      setStep(next);
    },
    [step],
  );

  /* readiness */
  const readiness = useMemo(
    () =>
      checkWorkerReadiness({
        name: form.name,
        status: form.status,
        capability: {
          platforms: form.platforms,
          tools: form.tools,
          strengths: form.strengths,
        },
      }),
    [form],
  );

  /* toggle helpers */
  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  /* ── Auth guard ── */
  useEffect(() => {
    const session = loadSession();
    if (!session) {
      nav("/login", { replace: true });
      return;
    }
    const existing = getWorkerByOwnerUserId(session.user.sub);
    if (existing) {
      nav(`/workers/${existing.id}`, { replace: true });
      return;
    }
    setAuthChecked(true);
  }, [nav]);

  /* portfolio url add */
  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setUrlError("http:// または https:// で始まるURLを入力してください");
      return;
    }
    if (form.portfolioUrls.length >= 5) {
      setUrlError("ポートフォリオURLは最大5つまでです");
      return;
    }
    set({ portfolioUrls: [...form.portfolioUrls, trimmed] });
    setUrlInput("");
    setUrlError("");
  };

  const removeUrl = (idx: number) => {
    set({ portfolioUrls: form.portfolioUrls.filter((_, i) => i !== idx) });
  };

  /* save */
  const handleSave = () => {
    const session = loadSession();
    createWorker({
      name: form.name.trim(),
      status: form.status,
      timezone: form.timezone,
      headline: form.headline.trim(),
      capabilities: [
        {
          id: `cap_${Date.now().toString(36)}`,
          type: "video_edit",
          platforms: form.platforms,
          tools: form.tools,
          strengths: form.strengths,
          portfolioUrls: form.portfolioUrls,
        },
      ],
      ownerUserId: session?.user.sub,
    });
    setToast(true);
    setTimeout(() => nav("/workers"), 1200);
  };

  if (!authChecked) return null;

  /* ── Render steps ── */

  const renderStep = () => {
    switch (step) {
      /* Step 0: Profile */
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="例: 田中太郎"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]
                           text-[13px] text-white placeholder:text-neutral-700
                           focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05]
                           transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Status <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set({ status: opt.value })}
                    className={`px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-200
                               cursor-pointer select-none hover:scale-[1.04] active:scale-[0.97]
                               ${form.status === opt.value ? opt.cls : "bg-white/[0.03] text-neutral-600 border-white/[0.06] hover:border-white/[0.12]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => set({ timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]
                           text-[13px] text-white
                           focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05]
                           transition-all duration-200"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-[#0a0a0a] text-white">
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => set({ headline: e.target.value })}
                placeholder="例: TikTok特化のショート動画エディター"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]
                           text-[13px] text-white placeholder:text-neutral-700
                           focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05]
                           transition-all duration-200"
              />
            </div>
          </div>
        );

      /* Step 1: Capability */
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Platforms <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <Chip key={p} label={p} selected={form.platforms.includes(p)} onClick={() => set({ platforms: toggle(form.platforms, p) })} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Tools <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <Chip key={t} label={t} selected={form.tools.includes(t)} onClick={() => set({ tools: toggle(form.tools, t) })} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Strengths <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STRENGTHS.map((s) => (
                  <Chip key={s} label={s} selected={form.strengths.includes(s)} onClick={() => set({ strengths: toggle(form.strengths, s) })} />
                ))}
              </div>
            </div>
            {!canProceed(1, form) && (
              <p className="text-[11px] text-amber-400/80">
                各カテゴリから最低1つ選択してください
              </p>
            )}
          </div>
        );

      /* Step 2: Portfolio */
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
                Portfolio URLs（任意・最大5つ）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addUrl()}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]
                             text-[13px] text-white placeholder:text-neutral-700
                             focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05]
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-semibold
                             bg-white/[0.06] text-neutral-300 border border-white/[0.08]
                             hover:bg-white/[0.12] hover:text-white
                             transition-all duration-200 cursor-pointer"
                >
                  追加
                </button>
              </div>
              {urlError && (
                <p className="mt-2 text-[11px] text-red-400">{urlError}</p>
              )}
            </div>

            {form.portfolioUrls.length > 0 && (
              <div className="space-y-2">
                {form.portfolioUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                               bg-white/[0.025] border border-white/[0.06]"
                  >
                    <svg className="w-3.5 h-3.5 text-neutral-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.182-5.055a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <span className="flex-1 text-[12px] text-neutral-300 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeUrl(i)}
                      className="text-neutral-700 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.portfolioUrls.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[12px] text-neutral-700">
                  ポートフォリオURLを追加すると、スキルの証明になります
                </p>
              </div>
            )}
          </div>
        );

      /* Step 3: Review */
      case 3:
        return (
          <div className="space-y-5">
            {/* completeness */}
            <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
                  Completeness
                </span>
                <span className={`text-[13px] font-bold ${readiness.pct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                  {readiness.pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${readiness.pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${readiness.pct}%` }}
                />
              </div>
              {readiness.missing.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {readiness.missing.map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400/70 border border-red-500/10">
                      {m}が未入力
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* summary rows */}
            <div className="space-y-3">
              <SummaryRow label="Name" value={form.name || "—"} />
              <SummaryRow label="Status" value={form.status} />
              <SummaryRow label="Timezone" value={form.timezone} />
              <SummaryRow label="Headline" value={form.headline || "—"} />
              <SummaryRow label="Platforms">
                <TagList items={form.platforms} color="blue" />
              </SummaryRow>
              <SummaryRow label="Tools">
                <TagList items={form.tools} color="purple" />
              </SummaryRow>
              <SummaryRow label="Strengths">
                <TagList items={form.strengths} color="amber" />
              </SummaryRow>
              <SummaryRow label="Portfolio" value={form.portfolioUrls.length > 0 ? `${form.portfolioUrls.length} URL` : "なし"} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
            Workers / New
          </p>
          <h1 className="text-xl font-bold tracking-tight">ワーカー登録</h1>
        </div>

        {/* progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-neutral-500">
              Step {step + 1} / {STEP_LABELS.length}
            </span>
            <span className={`text-[11px] font-mono ${readiness.pct === 100 ? "text-emerald-400" : "text-neutral-500"}`}>
              {readiness.pct}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* step indicators */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEP_LABELS.map((label, i) => {
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  // allow going back or to completed steps
                  if (i <= step) goStep(i as Step);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium
                           transition-all duration-200 cursor-pointer select-none shrink-0
                           ${isActive
                             ? "bg-white/[0.08] text-white border border-white/[0.12]"
                             : isComplete
                               ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                               : "bg-white/[0.02] text-neutral-600 border border-white/[0.04]"
                           }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                             ${isActive
                               ? "bg-white text-black"
                               : isComplete
                                 ? "bg-emerald-500/25 text-emerald-400"
                                 : "bg-white/[0.06] text-neutral-700"
                             }`}
                >
                  {isComplete ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* main grid: form + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* left: form */}
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-[14px] font-semibold mb-5">
              {STEP_LABELS[step]}
            </h2>

            <div
              key={animKey}
              className={direction === "next" ? "animate-[fadeSlideIn_0.25s_ease-out]" : "animate-[fadeSlideInReverse_0.25s_ease-out]"}
            >
              {renderStep()}
            </div>

            {/* navigation */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => step > 0 && goStep((step - 1) as Step)}
                disabled={step === 0}
                className={`px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer
                           ${step === 0
                             ? "text-neutral-800 cursor-not-allowed"
                             : "bg-white/[0.04] text-neutral-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
                           }`}
              >
                戻る
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => canProceed(step, form) && goStep((step + 1) as Step)}
                  disabled={!canProceed(step, form)}
                  className={`px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer
                             ${canProceed(step, form)
                               ? "bg-white text-black hover:shadow-lg active:scale-[0.97]"
                               : "bg-white/[0.06] text-neutral-700 cursor-not-allowed"
                             }`}
                >
                  次へ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={readiness.pct < 100}
                  className={`px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer
                             ${readiness.pct === 100
                               ? "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg active:scale-[0.97]"
                               : "bg-white/[0.06] text-neutral-700 cursor-not-allowed"
                             }`}
                >
                  保存して登録
                </button>
              )}
            </div>
          </div>

          {/* right: preview card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-4">
                Preview
              </p>

              {/* name + status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold truncate">
                    {form.name || "名前未入力"}
                  </h3>
                  {form.headline && (
                    <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{form.headline}</p>
                  )}
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${STATUS_PILL[form.status]}`}>
                  {form.status}
                </span>
              </div>

              {/* timezone */}
              <p className="text-[10px] text-neutral-700 font-mono mb-4">{form.timezone}</p>

              {/* platform tags */}
              {form.platforms.length > 0 && (
                <div className="mb-3">
                  <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-1.5">Platforms</p>
                  <div className="flex flex-wrap gap-1">
                    {form.platforms.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* tool tags */}
              {form.tools.length > 0 && (
                <div className="mb-3">
                  <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-1.5">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {form.tools.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* strength tags */}
              {form.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-1.5">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {form.strengths.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* portfolio count */}
              {form.portfolioUrls.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-neutral-600">
                    <span className="text-neutral-400 font-medium">{form.portfolioUrls.length}</span> portfolio URL{form.portfolioUrls.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* empty preview hint */}
              {!form.name && form.platforms.length === 0 && form.tools.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-[11px] text-neutral-700">フォームに入力するとプレビューが更新されます</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        animate-[fadeSlideUp_0.3s_ease-out]">
          <div className="px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl
                          text-[13px] font-semibold text-emerald-300 shadow-lg shadow-emerald-500/10">
            ワーカーを登録しました
          </div>
        </div>
      )}

      {/* animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideInReverse {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function SummaryRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-white/[0.04]">
      <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 w-24 shrink-0 pt-0.5">
        {label}
      </span>
      {children ?? <span className="text-[13px] text-neutral-300">{value}</span>}
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/15",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/15",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/15",
};

function TagList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) return <span className="text-[13px] text-neutral-700">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${TAG_COLORS[color]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}
