import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { getAllJobs, deleteJob, checkReadiness } from "../lib/storage";
import type { Job, JobStatus } from "../lib/storage";

/* ── Status config ── */

const STATUS_STYLE: Record<JobStatus, { label: string; cls: string }> = {
  draft: {
    label: "下書き",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  ready: {
    label: "準備完了",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  in_progress: {
    label: "制作中",
    cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  review: {
    label: "レビュー",
    cls: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  done: {
    label: "完了",
    cls: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ── Component ── */

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const refresh = useCallback(() => setJobs(getAllJobs()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("この案件を削除しますか？")) return;
      deleteJob(id);
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
              Jobs
            </p>
            <h1 className="text-xl font-bold tracking-tight">案件一覧</h1>
          </div>
          <Link
            to="/brief/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                       bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline"
          >
            + 新規ブリーフ
          </Link>
        </div>

        {/* empty state */}
        {jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-600 mb-1">まだ案件がありません</p>
            <p className="text-[12px] text-neutral-700">ブリーフを作成して、Jobとして保存してください</p>
          </div>
        )}

        {/* job cards */}
        <div className="space-y-3">
          {jobs.map((job) => {
            const r = checkReadiness(job.brief);
            const pct = Math.round((r.filled / r.total) * 100);
            const st = STATUS_STYLE[job.status];
            const title = [job.brief.purpose, job.brief.duration, job.brief.target]
              .filter(Boolean)
              .join(" / ") || "無題のブリーフ";

            return (
              <div
                key={job.id}
                className="group bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5
                           hover:border-white/[0.12] hover:bg-white/[0.04]
                           transition-all duration-200"
              >
                {/* top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold truncate">{title}</h3>
                    <p className="text-[11px] text-neutral-600 font-mono mt-0.5">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>

                {/* progress bar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 shrink-0">
                    {pct}%
                  </span>
                </div>

                {/* missing chips */}
                {r.missing.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {r.missing.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium
                                   bg-red-500/10 text-red-400/70 border border-red-500/10"
                      >
                        {m}が未設定
                      </span>
                    ))}
                  </div>
                )}

                {/* actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
                               no-underline transition-all
                               ${job.status === "draft"
                                 ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25"
                                 : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                               }`}
                  >
                    {job.status === "draft" ? "素材を追加して完了" : "指示書を見る"}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-2 rounded-xl text-[12px] text-neutral-700
                               hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
