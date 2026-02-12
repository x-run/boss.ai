import { useState } from "react";
import type { Brief } from "../../types/brief";

/* ── Types ── */

interface BriefPanelProps {
  brief: Brief;
  completeness: number;
  done: boolean;
  onOpenAssets: () => void;
  onSaveAsJob?: () => void;
}

/* ── Component ── */

export default function BriefPanel({
  brief,
  completeness,
  done,
  onOpenAssets,
  onSaveAsJob,
}: BriefPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const assetHasAny = !!(
    brief.assets_url ||
    brief.bgm_url ||
    brief.logo_url ||
    brief.thumb_url ||
    brief.font_note
  );

  /* ── shared panel content ── */
  const panelContent = (
    <>
      {/* header */}
      <div className="px-6 pt-6 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">制作ブリーフ</h2>
          <span className="text-[10px] font-mono text-neutral-600">
            {completeness}% 完成
          </span>
        </div>
        <button
          onClick={onOpenAssets}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold
                     bg-white/[0.03] border border-white/[0.07] text-neutral-400
                     hover:bg-white/[0.07] hover:text-white active:scale-[0.98] transition-all"
        >
          + 素材を追加
        </button>
      </div>

      {/* fields */}
      <div className="px-6 pb-6 space-y-4">
        <Field label="用途 / Platform" value={brief.purpose} />
        <Field label="尺 / Duration" value={brief.duration} />
        <Field label="ターゲット / Target" value={brief.target} />

        {/* tones */}
        <div>
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1.5">
            トーン / Tone
          </p>
          {brief.tones.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {brief.tones.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium
                             bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-800">—</p>
          )}
        </div>

        <Field label="コンセプト / Concept" value={brief.concept} />
        <Field label="その他 / Notes" value={brief.details} />

        {/* assets summary */}
        {assetHasAny && (
          <div>
            <div className="h-px bg-white/[0.04] mb-4" />
            <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
              素材 / Assets
            </p>
            <div className="space-y-2 text-[12px]">
              {brief.assets_url && (
                <AssetLink label="素材共有リンク" url={brief.assets_url} />
              )}
              {brief.bgm_url && (
                <AssetLink label="BGM候補" url={brief.bgm_url} />
              )}
              {brief.logo_url && (
                <AssetLink label="ロゴ素材" url={brief.logo_url} />
              )}
              {brief.thumb_url && (
                <AssetLink label="サムネイル素材" url={brief.thumb_url} />
              )}
              {brief.font_note && (
                <div>
                  <p className="text-[10px] text-neutral-600 mb-0.5">
                    フォント指定
                  </p>
                  <p className="text-white">{brief.font_note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* completion card */}
        {done && (
          <div className="mt-8 p-5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/[0.15]">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-emerald-400">
                ブリーフ完成
              </p>
            </div>
            <p className="text-[12px] text-emerald-500/60 leading-relaxed">
              AIがこの内容をもとに制作プランを設計します。
            </p>
            {onSaveAsJob && (
              <button
                onClick={onSaveAsJob}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           text-[13px] font-semibold transition-all
                           bg-white text-black hover:shadow-lg active:scale-[0.97]"
              >
                Jobとして保存
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop: static aside ── */}
      <aside className="hidden lg:block w-[340px] border-l border-white/[0.06] bg-[#080808] overflow-y-auto">
        {panelContent}
      </aside>

      {/* ── Mobile: floating trigger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden
                   flex items-center gap-2 px-4 py-3 rounded-full
                   bg-neutral-900/90 border border-white/[0.1]
                   text-[12px] font-semibold text-neutral-300
                   shadow-lg shadow-black/40 backdrop-blur-sm
                   hover:text-white active:scale-95
                   transition-all duration-150"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
        ブリーフ {completeness}%
      </button>

      {/* ── Mobile: slide-in panel + backdrop ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 animate-[fadeIn_0.2s_ease]"
            onClick={() => setMobileOpen(false)}
          />

          {/* panel */}
          <aside
            className="absolute top-0 right-0 bottom-0 w-[min(340px,85vw)]
                       bg-[#080808] border-l border-white/[0.06]
                       overflow-y-auto
                       animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* close button */}
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
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
            {panelContent}
          </aside>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ── */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1.5">
        {label}
      </p>
      <p
        className={`text-sm leading-relaxed ${value ? "text-white" : "text-neutral-800"}`}
      >
        {value || "—"}
      </p>
      <div className="h-px bg-white/[0.04] mt-4" />
    </div>
  );
}

function AssetLink({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-[10px] text-neutral-600 mb-0.5">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-full truncate text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        {url}
      </a>
    </div>
  );
}
