import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { getAllWorkers, deleteWorker, type Worker, type WorkerStatus } from "../lib/workers";

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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Component ── */

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  const refresh = useCallback(() => setWorkers(getAllWorkers()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("このワーカーを削除しますか？")) return;
      deleteWorker(id);
      refresh();
    },
    [refresh],
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
              Workers
            </p>
            <h1 className="text-xl font-bold tracking-tight">ワーカー一覧</h1>
          </div>
          <Link
            to="/workers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                       bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline"
          >
            + Workerを登録
          </Link>
        </div>

        {/* empty state */}
        {workers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-600 mb-1">まだワーカーがいません</p>
            <p className="text-[12px] text-neutral-700">
              Workerを登録して、案件にアサインしましょう
            </p>
          </div>
        )}

        {/* worker cards */}
        <div className="space-y-3">
          {workers.map((w) => {
            const cap = w.capabilities[0];
            const st = STATUS_STYLE[w.status];

            return (
              <Link
                key={w.id}
                to={`/workers/${w.id}`}
                className="group block bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5
                           hover:border-white/[0.12] hover:bg-white/[0.04]
                           transition-all duration-200 no-underline"
              >
                {/* top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold truncate text-white">{w.name}</h3>
                    {w.headline && (
                      <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{w.headline}</p>
                    )}
                    <p className="text-[10px] text-neutral-700 font-mono mt-0.5">
                      {formatDate(w.createdAt)} · {w.timezone}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                    {st.label}
                  </span>
                </div>

                {/* tags */}
                {cap && (
                  <div className="space-y-2 mb-4">
                    {/* platforms */}
                    {cap.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cap.platforms.map((p) => (
                          <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* strengths */}
                    {cap.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cap.strengths.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* actions */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
                                   bg-emerald-500/15 text-emerald-400 border border-emerald-500/20
                                   group-hover:bg-emerald-500/25 transition-all">
                    詳細を見る
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, w.id)}
                    className="px-3 py-2 rounded-xl text-[12px] text-neutral-700
                               hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    削除
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
