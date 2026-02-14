import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { Link, useNavigate } from "react-router";
import {
  getAllWorkers,
  type Worker,
  type WorkerStatus,
  type PlatformTag,
  type StrengthTag,
  PLATFORMS,
  STRENGTHS,
} from "../lib/workers";
import { loadSession } from "../lib/auth";
import { deriveProfile, CLASS_ICONS, type DerivedProfile } from "../lib/workerProfile";

/* ── Status config ── */

const STATUS_STYLE: Record<WorkerStatus, { label: string; dot: string; cls: string }> = {
  available: {
    label: "Available",
    dot: "bg-emerald-400",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  busy: {
    label: "Busy",
    dot: "bg-amber-400",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  offline: {
    label: "Offline",
    dot: "bg-neutral-500",
    cls: "bg-neutral-500/15 text-neutral-500 border-neutral-500/20",
  },
};

const STATUS_OPTIONS: WorkerStatus[] = ["available", "busy", "offline"];

/* ── Editor class icon SVGs ── */

const CLASS_SVG: Record<string, React.ReactNode> = {
  scissors: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L7.05 21.192m0-14.142l7.071 7.071m2.828-2.828a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243zm-9.9 9.9a3 3 0 104.244-4.244 3 3 0 00-4.243 4.243z" />
    </svg>
  ),
  palette: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" />
    </svg>
  ),
  zap: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  headphones: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
};

/* ── Stat bar color ── */

const STAT_BAR_COLOR: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

/* ── Component ── */

export default function WorkerBrowse() {
  const nav = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterPlatform, setFilterPlatform] = useState<PlatformTag | null>(null);
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | null>(null);
  const [filterStrength, setFilterStrength] = useState<StrengthTag | null>(null);

  /* auth guard */
  useEffect(() => {
    const session = loadSession();
    if (!session) {
      nav("/login", { replace: true });
    }
  }, [nav]);

  /* load workers */
  const refresh = useCallback(() => setWorkers(getAllWorkers()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  /* derive profiles (memoized per worker set) */
  const workerProfiles = useMemo(() => {
    const map = new Map<string, DerivedProfile>();
    for (const w of workers) {
      map.set(w.id, deriveProfile(w));
    }
    return map;
  }, [workers]);

  /* filtered results */
  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return workers.filter((w) => {
      /* text search */
      if (q) {
        const haystack = `${w.name} ${w.headline}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      /* platform filter */
      if (filterPlatform) {
        const cap = w.capabilities[0];
        if (!cap || !cap.platforms.includes(filterPlatform)) return false;
      }
      /* status filter */
      if (filterStatus && w.status !== filterStatus) return false;
      /* strength filter */
      if (filterStrength) {
        const cap = w.capabilities[0];
        if (!cap || !cap.strengths.includes(filterStrength)) return false;
      }
      return true;
    });
  }, [workers, deferredSearch, filterPlatform, filterStatus, filterStrength]);

  const hasActiveFilters = !!deferredSearch || !!filterPlatform || !!filterStatus || !!filterStrength;

  const clearFilters = () => {
    setSearch("");
    setFilterPlatform(null);
    setFilterStatus(null);
    setFilterStrength(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
            Browse Editors
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">編集者を探す</h1>
              <p className="text-[12px] text-neutral-600 mt-1">
                {workers.length} 人の編集者が登録されています
              </p>
            </div>
            <Link
              to="/workers/new"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                         bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              登録する
            </Link>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="名前やスキルで検索..."
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

          {/* Filter rows */}
          <div className="space-y-3">
            {/* Platform */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 w-16 shrink-0">
                Platform
              </span>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer
                    ${filterPlatform === p
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 w-16 shrink-0">
                Status
              </span>
              {STATUS_OPTIONS.map((s) => {
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
            </div>

            {/* Strengths */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 w-16 shrink-0">
                Skill
              </span>
              {STRENGTHS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStrength(filterStrength === s ? null : s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer
                    ${filterStrength === s
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-neutral-500">
                {filtered.length} 件の結果
              </span>
              <button
                onClick={clearFilters}
                className="text-[11px] text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                フィルタをクリア
              </button>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            {hasActiveFilters ? (
              <>
                <p className="text-sm text-neutral-600 mb-1">条件に一致する編集者が見つかりません</p>
                <button
                  onClick={clearFilters}
                  className="text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mt-2"
                >
                  フィルタをクリア
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600 mb-1">まだ編集者が登録されていません</p>
                <p className="text-[12px] text-neutral-700">
                  最初の編集者として登録しましょう
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Worker Card Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => {
            const profile = workerProfiles.get(w.id);
            if (!profile) return null;
            const cap = w.capabilities[0];
            const st = STATUS_STYLE[w.status];
            const classIcon = CLASS_ICONS[profile.editorClass];
            const topStats = profile.stats.slice(0, 4);

            return (
              <Link
                key={w.id}
                to={`/workers/${w.id}`}
                className="group block bg-white/[0.025] border border-white/[0.06] rounded-2xl
                           hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5
                           transition-all duration-200 no-underline overflow-hidden cursor-pointer"
              >
                {/* Card top: gradient accent */}
                <div className="h-1 bg-gradient-to-r from-emerald-500/40 via-blue-500/40 to-purple-500/40
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-5">
                  {/* ── Row 1: Avatar + Name + Status ── */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {w.avatarUrl ? (
                        <img
                          src={w.avatarUrl}
                          alt={w.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/[0.08]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] ring-2 ring-white/[0.08] flex items-center justify-center">
                          <span className="text-[15px] font-bold text-neutral-500">
                            {w.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Level badge */}
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md
                                      bg-neutral-900 border border-white/[0.1] text-[9px] font-bold text-white">
                        {profile.level}
                      </div>
                    </div>

                    {/* Name + class */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-white truncate leading-tight">
                        {w.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-neutral-500">
                          {CLASS_SVG[classIcon]}
                        </span>
                        <span className="text-[10px] font-medium text-neutral-500">
                          {profile.editorClass}
                        </span>
                      </div>
                      {w.headline && (
                        <p className="text-[11px] text-neutral-600 mt-1 truncate">
                          {w.headline}
                        </p>
                      )}
                    </div>

                    {/* Status pill */}
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* ── Stats mini-bars ── */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    {topStats.map((stat) => (
                      <div key={stat.key} className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-neutral-600 w-10 shrink-0 truncate">
                          {stat.label.slice(0, 5)}
                        </span>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${STAT_BAR_COLOR[stat.color] ?? "bg-emerald-500"} transition-all`}
                            style={{ width: `${stat.value}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-neutral-600 w-5 text-right">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Tags: Platforms + Strengths ── */}
                  {cap && (
                    <div className="space-y-2 mb-4">
                      {cap.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cap.platforms.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                      {cap.strengths.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cap.strengths.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Badges (top 3) ── */}
                  {profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {profile.badges.slice(0, 3).map((b) => (
                        <span
                          key={b.label}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold border ${b.color}`}
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── CTA row ── */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {/* XP bar mini */}
                      <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500/60"
                          style={{ width: `${profile.xpProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-700">
                        LV {profile.level}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500
                                     group-hover:text-emerald-400 transition-colors">
                      プロフィール
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
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
