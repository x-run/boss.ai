import type { Worker, WorkerStatus } from "../../lib/workers";
import type { EditorClass } from "../../lib/workerProfile";
import { CLASS_ICONS } from "../../lib/workerProfile";

const STATUS_RING: Record<WorkerStatus, string> = {
  available: "ring-emerald-500/60",
  busy: "ring-amber-500/60",
  offline: "ring-neutral-500/40",
};

const STATUS_DOT: Record<WorkerStatus, string> = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-neutral-500",
};

const CLASS_COLOR: Record<EditorClass, string> = {
  Cutter: "text-rose-400",
  Colorist: "text-purple-400",
  Motion: "text-cyan-400",
  Sound: "text-amber-400",
};

function ClassIcon({ cls }: { cls: EditorClass }) {
  const icon = CLASS_ICONS[cls];
  switch (icon) {
    case "scissors":
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      );
    case "palette":
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" />
        </svg>
      );
    case "zap":
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "headphones":
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      );
  }
}

interface Props {
  worker: Worker;
  level: number;
  xpProgress: number;
  xpDelta: number;
  editorClass: EditorClass;
}

export default function ProfileHeader({ worker, level, xpProgress, xpDelta, editorClass }: Props) {
  return (
    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={`w-20 h-20 rounded-full ring-3 ${STATUS_RING[worker.status]} overflow-hidden bg-white/[0.05]`}>
            {worker.avatarUrl ? (
              <img
                src={worker.avatarUrl}
                alt={worker.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-600">
                {worker.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Status dot */}
          <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full ${STATUS_DOT[worker.status]} border-2 border-[#0a0a0a]`} />
          {/* Level badge */}
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md bg-white/[0.1] border border-white/[0.15] text-[9px] font-bold text-white backdrop-blur-sm">
            {level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-tight truncate">{worker.name}</h1>
          </div>

          {/* Editor class */}
          <div className={`flex items-center gap-1.5 mb-3 ${CLASS_COLOR[editorClass]}`}>
            <ClassIcon cls={editorClass} />
            <span className="text-[11px] font-semibold tracking-wide">{editorClass} Class</span>
          </div>

          {/* XP bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
                LV {level}
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">
                +{xpDelta} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Headline */}
      {worker.headline && (
        <p className="text-[12px] text-neutral-500 mt-4 pl-[100px]">
          {worker.headline}
        </p>
      )}
    </div>
  );
}
