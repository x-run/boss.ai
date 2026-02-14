import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { Link } from "react-router";
import {
  getAllWorkers,
  type Worker,
  type WorkerStatus,
  type PlatformTag,
  PLATFORMS,
} from "../lib/workers";

/* ── Status config ── */

const STATUS_CFG: Record<WorkerStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  available: { label: "Available", dot: "bg-emerald-400", bg: "bg-emerald-500/12", text: "text-emerald-400", border: "border-emerald-500/25" },
  busy:      { label: "Busy",      dot: "bg-amber-400",   bg: "bg-amber-500/12",   text: "text-amber-400",   border: "border-amber-500/25" },
  offline:   { label: "Offline",   dot: "bg-neutral-500", bg: "bg-neutral-500/12",  text: "text-neutral-400", border: "border-neutral-500/25" },
};

/* ── Component ── */

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterPlatform, setFilterPlatform] = useState<PlatformTag | null>(null);
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | null>(null);

  const refresh = useCallback(() => setWorkers(getAllWorkers()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  /* filtered */
  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return workers.filter((w) => {
      if (q) {
        const haystack = `${w.name} ${w.headline} ${(w.skills ?? []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterPlatform) {
        const cap = w.capabilities[0];
        if (!cap || !cap.platforms.includes(filterPlatform)) return false;
      }
      if (filterStatus && w.status !== filterStatus) return false;
      return true;
    });
  }, [workers, deferredSearch, filterPlatform, filterStatus]);

  const hasFilters = !!deferredSearch || !!filterPlatform || !!filterStatus;

  const clearFilters = () => {
    setSearch("");
    setFilterPlatform(null);
    setFilterStatus(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ═══════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white">
                編集者
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                {workers.length} editors registered
                {hasFilters && ` · ${filtered.length} matching`}
              </p>
            </div>
            <Link
              to="/workers/new"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                         bg-white text-black hover:shadow-lg hover:shadow-white/10
                         active:scale-[0.97] transition-all no-underline shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              登録する
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SEARCH + FILTERS
        ═══════════════════════════════════════════════ */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or keyword..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-[13px]
                         bg-white/[0.03] border border-white/[0.06] text-white
                         placeholder:text-neutral-600
                         focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05]
                         transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform chips */}
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 cursor-pointer
                  ${filterPlatform === p
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                  }`}
              >
                {p}
              </button>
            ))}

            <span className="w-px h-5 bg-white/[0.06]" />

            {/* Status chips */}
            {(["available", "busy", "offline"] as WorkerStatus[]).map((s) => {
              const cfg = STATUS_CFG[s];
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(active ? null : s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 cursor-pointer
                    ${active
                      ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                      : "bg-white/[0.02] text-neutral-500 border-white/[0.06] hover:border-white/[0.12] hover:text-neutral-300"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? cfg.dot : "bg-neutral-600"}`} />
                  {cfg.label}
                </button>
              );
            })}

            {hasFilters && (
              <>
                <span className="w-px h-5 bg-white/[0.06]" />
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            EMPTY STATE
        ═══════════════════════════════════════════════ */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]
                            flex items-center justify-center">
              <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            {hasFilters ? (
              <>
                <p className="text-[14px] text-neutral-400 mb-1">No editors match your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mt-2"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-[14px] text-neutral-400 mb-1">No editors registered yet</p>
                <p className="text-[12px] text-neutral-600">Be the first to register as an editor.</p>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            CARD GRID
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WORKER CARD
═══════════════════════════════════════════════════════ */

function WorkerCard({ worker: w }: { worker: Worker }) {
  const cap = w.capabilities[0];
  const sc = STATUS_CFG[w.status];
  const skills = w.skills ?? [];
  const hasSocials = w.socials && Object.values(w.socials).some((v) => v?.trim());

  return (
    <Link
      to={`/workers/${w.id}`}
      className="group relative block rounded-2xl border border-white/[0.06] bg-white/[0.025]
                 hover:border-white/[0.12] hover:bg-white/[0.04]
                 transition-all duration-300 no-underline overflow-hidden cursor-pointer"
    >
      {/* hover accent bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">
        {/* ── Row 1: Avatar + Name + Status ── */}
        <div className="flex items-start gap-3.5 mb-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {w.avatarUrl ? (
              <img
                src={w.avatarUrl}
                alt={w.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/[0.08]
                           group-hover:ring-emerald-500/20 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800
                              ring-2 ring-white/[0.08] group-hover:ring-emerald-500/20
                              flex items-center justify-center transition-all duration-300">
                <span className="text-[16px] font-bold text-neutral-400">
                  {w.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* online dot */}
            {w.status === "available" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#050505]
                              flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            )}
          </div>

          {/* Name + headline */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-white truncate leading-tight
                           group-hover:text-emerald-50 transition-colors">
              {w.name}
            </h3>
            {w.headline && (
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{w.headline}</p>
            )}
            {w.locationText && (
              <p className="flex items-center gap-1 text-[10px] text-neutral-600 mt-1">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {w.locationText}
              </p>
            )}
          </div>

          {/* Status */}
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                           text-[10px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>

        {/* ── Skills tags ── */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 4).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-white/[0.04] text-neutral-400 border border-white/[0.06]">
                {s}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-neutral-600">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Platform + Strength tags ── */}
        {cap && (cap.platforms.length > 0 || cap.strengths.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cap.platforms.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-blue-500/8 text-blue-400 border border-blue-500/15">
                {p}
              </span>
            ))}
            {cap.strengths.slice(0, 2).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-amber-500/8 text-amber-400/80 border border-amber-500/12">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer: socials hint + CTA ── */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            {/* Social icons (collapsed) */}
            {hasSocials && (
              <div className="flex items-center -space-x-0.5">
                {w.socials?.twitter && (
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </div>
                )}
                {w.socials?.instagram && (
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </div>
                )}
                {w.socials?.youtube && (
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                  </div>
                )}
              </div>
            )}
            {!hasSocials && w.locationText && (
              <span className="text-[10px] text-neutral-700 font-mono">
                {w.timezone}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500
                           group-hover:text-emerald-400 transition-colors duration-200">
            View Profile
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
