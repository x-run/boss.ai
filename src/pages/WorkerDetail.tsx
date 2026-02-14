import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getWorker, deleteWorker, type Worker } from "../lib/workers";
import { deriveProfile } from "../lib/workerProfile";
import ProfileHeader from "../components/worker/ProfileHeader";
import StatsGrid from "../components/worker/StatsGrid";
import SkillsPanel from "../components/worker/SkillsPanel";
import BadgesPanel from "../components/worker/BadgesPanel";
import ActivityLog from "../components/worker/ActivityLog";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function WorkerDetail({ workerId: overrideId }: { workerId?: string } = {}) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = overrideId ?? paramId;
  const nav = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    if (id) setWorker(getWorker(id));
  }, [id]);

  const profile = useMemo(
    () => (worker ? deriveProfile(worker) : null),
    [worker],
  );

  const handleDelete = () => {
    if (!id || !confirm("このワーカーを削除しますか？")) return;
    deleteWorker(id);
    nav("/workers");
  };

  if (!worker || !profile) {
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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
          <span className="text-neutral-800 mx-2">·</span>
          <span className="text-[10px] text-neutral-700 font-mono">
            {formatDate(worker.createdAt)} · {worker.timezone}
          </span>
        </div>

        {/* ── Profile Header (Avatar + LV + XP) ── */}
        <div className="mb-6">
          <ProfileHeader
            worker={worker}
            level={profile.level}
            xpProgress={profile.xpProgress}
            xpDelta={profile.xpDelta}
            editorClass={profile.editorClass}
          />
        </div>

        {/* ── Two-column layout: left = main, right = sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Stats */}
            <StatsGrid stats={profile.stats} />

            {/* Skills */}
            <SkillsPanel skills={profile.skills} />

            {/* Portfolio (preserved from original) */}
            {cap && cap.portfolioUrls.length > 0 && (
              <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
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
          </div>

          {/* Right column (sidebar) */}
          <div className="space-y-6">
            {/* Badges + Equipment */}
            <BadgesPanel badges={profile.badges} equipment={profile.equipment} />

            {/* Activity Log */}
            <ActivityLog activities={profile.activityLog} />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/[0.06]">
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
