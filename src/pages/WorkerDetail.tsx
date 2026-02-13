import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getWorker, deleteWorker, type Worker, type WorkerStatus } from "../lib/workers";

/* ── Status config ── */

const STATUS_STYLE: Record<WorkerStatus, { label: string; cls: string }> = {
  available: {
    label: "Available",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  busy: {
    label: "Busy",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  offline: {
    label: "Offline",
    cls: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  },
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ── Component ── */

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (id) setWorker(getWorker(id));
  }, [id]);

  const handleDelete = () => {
    if (!id || !confirm("このワーカーを削除しますか？")) return;
    deleteWorker(id);
    nav("/workers");
  };

  if (!worker) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-3">ワーカーが見つかりません</p>
          <Link
            to="/workers"
            className="text-[12px] text-emerald-400 hover:text-emerald-300 no-underline"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const cap = worker.capabilities[0];
  const st = STATUS_STYLE[worker.status];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* breadcrumb */}
        <div className="mb-6">
          <Link
            to="/workers"
            className="text-[11px] text-neutral-600 hover:text-neutral-300 transition-colors no-underline"
          >
            Workers
          </Link>
          <span className="text-neutral-800 mx-2">/</span>
          <span className="text-[11px] text-neutral-400">{worker.name}</span>
        </div>

        {/* header card */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">{worker.name}</h1>
              {worker.headline && (
                <p className="text-[13px] text-neutral-500 mt-1">{worker.headline}</p>
              )}
              <p className="text-[10px] text-neutral-700 font-mono mt-2">
                {formatDate(worker.createdAt)} · {worker.timezone}
              </p>
            </div>
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${st.cls}`}>
              {st.label}
            </span>
          </div>

          {/* assign hint */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <span className="text-[11px] text-blue-400/80">
              案件アサインの候補ワーカー
            </span>
          </div>
        </div>

        {/* capability section */}
        {cap && (
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-5">
              Capability
            </h2>

            <div className="space-y-5">
              {/* platforms */}
              <div>
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-2">Platforms</p>
                <div className="flex flex-wrap gap-1.5">
                  {cap.platforms.map((p) => (
                    <span key={p} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* tools */}
              <div>
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-2">Tools</p>
                <div className="flex flex-wrap gap-1.5">
                  {cap.tools.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* strengths */}
              <div>
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-2">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {cap.strengths.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* portfolio section */}
        {cap && cap.portfolioUrls.length > 0 && (
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-6">
            <h2 className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-4">
              Portfolio
            </h2>
            <div className="space-y-2">
              {cap.portfolioUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                             bg-white/[0.02] border border-white/[0.06]
                             hover:border-white/[0.12] hover:bg-white/[0.04]
                             transition-all duration-200 no-underline group"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-600 group-hover:text-emerald-400 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.182-5.055a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <span className="flex-1 text-[12px] text-neutral-400 group-hover:text-neutral-200 truncate transition-colors">
                    {url}
                  </span>
                  <svg className="w-3 h-3 text-neutral-700 group-hover:text-neutral-400 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/workers"
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold
                       bg-white/[0.04] text-neutral-400 border border-white/[0.06]
                       hover:bg-white/[0.08] hover:text-white transition-all no-underline"
          >
            一覧に戻る
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold
                       text-red-400/70 hover:text-red-400 hover:bg-red-500/10
                       transition-all cursor-pointer"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
