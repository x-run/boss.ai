import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { Link } from "react-router";
import { getAllJobs, deleteJob, checkReadiness } from "../lib/storage";
import type { Job, JobStatus } from "../lib/storage";
import type { Platform, Tone } from "../types/brief";

/* ── Status config ── */

const STATUS_STYLE: Record<JobStatus, { label: string; dot: string; cls: string }> = {
  draft: {
    label: "Draft",
    dot: "bg-amber-400",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  ready: {
    label: "Open",
    dot: "bg-emerald-400",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-400",
    cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  review: {
    label: "Review",
    dot: "bg-purple-400",
    cls: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  done: {
    label: "Completed",
    dot: "bg-neutral-500",
    cls: "bg-neutral-500/15 text-neutral-500 border-neutral-500/20",
  },
};

const ALL_STATUSES: JobStatus[] = ["draft", "ready", "in_progress", "review", "done"];

const PLATFORM_STYLE: Record<string, string> = {
  TikTok: "bg-pink-500/10 text-pink-400 border-pink-500/15",
  Reels: "bg-violet-500/10 text-violet-400 border-violet-500/15",
  YouTube: "bg-red-500/10 text-red-400 border-red-500/15",
  "広告": "bg-orange-500/10 text-orange-400 border-orange-500/15",
};

const TONE_STYLE: Record<Tone, string> = {
  Energetic: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  Calm: "bg-sky-500/10 text-sky-400 border-sky-500/15",
  Luxury: "bg-purple-500/10 text-purple-400 border-purple-500/15",
  Casual: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
};

/* ── Helpers ── */

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}日前`;
  const wk = Math.floor(day / 7);
  return `${wk}週間前`;
}

function durationLabel(d: string): string {
  if (!d) return "";
  const num = parseInt(d, 10);
  if (isNaN(num)) return d;
  if (num < 60) return `${num}秒`;
  return `${Math.floor(num / 60)}分${num % 60 ? `${num % 60}秒` : ""}`;
}

/* ── Component ── */

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState<JobStatus | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | null>(null);

  const refresh = useCallback(() => setJobs(getAllJobs()), []);

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
      if (!confirm("この案件を削除しますか？")) return;
      deleteJob(id);
      refresh();
    },
    [refresh],
  );

  /* stats */
  const stats = useMemo(() => {
    const open = jobs.filter((j) => j.status === "ready").length;
    const active = jobs.filter((j) => j.status === "in_progress" || j.status === "review").length;
    const completed = jobs.filter((j) => j.status === "done").length;
    return { total: jobs.length, open, active, completed };
  }, [jobs]);

  /* filtered */
  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return jobs.filter((j) => {
      if (q) {
        const haystack = `${j.brief.purpose} ${j.brief.concept} ${j.brief.target} ${j.brief.details}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterStatus && j.status !== filterStatus) return false;
      if (filterPlatform && j.brief.purpose !== filterPlatform) return false;
      return true;
    });
  }, [jobs, deferredSearch, filterStatus, filterPlatform]);

  const hasActiveFilters = !!deferredSearch || !!filterStatus || !!filterPlatform;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus(null);
    setFilterPlatform(null);
  };

  const platforms: Platform[] = ["TikTok", "Reels", "YouTube", "広告"];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
            Task Bounties
          </p>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight">仕事一覧</h1>
              <p className="text-[12px] text-neutral-600 mt-1">
                動画制作の案件を探して応募する
              </p>
            </div>
            <Link
              to="/brief/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                         bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新規ブリーフ
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-white" },
              { label: "Open", value: stats.open, color: "text-emerald-400" },
              { label: "Active", value: stats.active, color: "text-blue-400" },
              { label: "Done", value: stats.completed, color: "text-neutral-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-3 text-center"
              >
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-neutral-600 mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="案件を検索..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-[13px]
                         bg-white/[0.03] border border-white/[0.06] text-white
                         placeholder:text-neutral-600
                         focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05]
                         transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                           text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.06]
                           transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {/* Status filters */}
            {ALL_STATUSES.map((s) => {
              const st = STATUS_STYLE[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer
                    ${filterStatus === s
                      ? st.cls
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === s ? st.dot : "bg-neutral-600"}`} />
                  {st.label}
                </button>
              );
            })}

            <span className="w-px h-6 bg-white/[0.06] self-center mx-1" />

            {/* Platform filters */}
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer
                  ${filterPlatform === p
                    ? PLATFORM_STYLE[p] ?? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-500">
                {filtered.length} 件の結果
              </span>
              <button
                onClick={clearFilters}
                className="text-[11px] text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                クリア
              </button>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            {hasActiveFilters ? (
              <>
                <p className="text-sm text-neutral-600 mb-1">条件に一致する案件がありません</p>
                <button
                  onClick={clearFilters}
                  className="text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mt-2"
                >
                  フィルタをクリア
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600 mb-1">まだ案件がありません</p>
                <p className="text-[12px] text-neutral-700">
                  ブリーフを作成して、最初の案件を投稿しましょう
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Bounty Cards ── */}
        <div className="space-y-3">
          {filtered.map((job) => {
            const r = checkReadiness(job.brief);
            const pct = Math.round((r.filled / r.total) * 100);
            const st = STATUS_STYLE[job.status];

            return (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group block bg-white/[0.025] border border-white/[0.06] rounded-2xl
                           hover:border-white/[0.12] hover:bg-white/[0.04]
                           transition-all duration-200 no-underline overflow-hidden cursor-pointer"
              >
                {/* Top accent bar — status colored */}
                <div
                  className={`h-0.5 transition-opacity duration-300 ${
                    job.status === "ready"
                      ? "bg-emerald-500/60"
                      : job.status === "in_progress"
                        ? "bg-blue-500/60"
                        : job.status === "review"
                          ? "bg-purple-500/60"
                          : job.status === "done"
                            ? "bg-neutral-500/40"
                            : "bg-amber-500/40"
                  } ${job.status === "ready" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                />

                <div className="p-5">
                  {/* Row 1: Title + Status + Time */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-[15px] font-semibold text-white truncate leading-tight">
                        {job.brief.concept || "無題のブリーフ"}
                      </h3>
                      {/* Subtitle: target audience */}
                      {job.brief.target && (
                        <p className="text-[11px] text-neutral-500 mt-1 truncate">
                          ターゲット: {job.brief.target}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-neutral-700">
                        {timeAgo(job.createdAt)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  {job.brief.details && (
                    <p className="text-[12px] text-neutral-500 leading-relaxed mb-3 line-clamp-2">
                      {job.brief.details}
                    </p>
                  )}

                  {/* Row 3: Spec tags — Platform, Duration, Tones */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {/* Platform badge */}
                    {job.brief.purpose && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${PLATFORM_STYLE[job.brief.purpose] ?? "bg-blue-500/10 text-blue-400 border-blue-500/15"}`}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        {job.brief.purpose}
                      </span>
                    )}

                    {/* Duration badge */}
                    {job.brief.duration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-neutral-400 border border-white/[0.06]">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {durationLabel(job.brief.duration)}
                      </span>
                    )}

                    {/* Tone badges */}
                    {job.brief.tones.map((t) => (
                      <span
                        key={t}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${TONE_STYLE[t]}`}
                      >
                        {t}
                      </span>
                    ))}

                    {/* Asset status */}
                    {job.brief.assets_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        素材あり
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/8 text-red-400/60 border border-red-500/10">
                        素材なし
                      </span>
                    )}
                  </div>

                  {/* Row 4: Progress + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    {/* Progress bar + pct */}
                    <div className="flex items-center gap-3 flex-1 mr-4">
                      <div className="flex-1 max-w-[200px] h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct === 100 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${pct === 100 ? "text-emerald-400" : "text-neutral-600"}`}>
                        {pct}%
                      </span>

                      {/* Missing chips (compact) */}
                      {r.missing.length > 0 && r.missing.length <= 3 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {r.missing.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded text-[9px] font-medium
                                         bg-red-500/8 text-red-400/50 border border-red-500/8"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500
                                       group-hover:text-emerald-400 transition-colors">
                        {job.status === "draft" ? "編集する" : "詳細を見る"}
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, job.id)}
                        className="p-1.5 rounded-lg text-neutral-700
                                   hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
