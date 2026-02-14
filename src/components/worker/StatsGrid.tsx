import type { StatEntry } from "../../lib/workerProfile";

const COLOR_MAP: Record<string, { bar: string; text: string; bg: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  blue: { bar: "bg-blue-500", text: "text-blue-400", bg: "bg-blue-500/10" },
  purple: { bar: "bg-purple-500", text: "text-purple-400", bg: "bg-purple-500/10" },
  cyan: { bar: "bg-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  amber: { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  rose: { bar: "bg-rose-500", text: "text-rose-400", bg: "bg-rose-500/10" },
};

function StatIcon({ statKey }: { statKey: string }) {
  switch (statKey) {
    case "speed":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "quality":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    case "consistency":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "communication":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    case "reliability":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "taste":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      );
    default:
      return null;
  }
}

interface Props {
  stats: StatEntry[];
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
      <h2 className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-5">
        Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => {
          const c = COLOR_MAP[s.color] ?? COLOR_MAP.emerald;
          return (
            <div
              key={s.key}
              className="group p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]
                         hover:bg-white/[0.04] hover:border-white/[0.1]
                         hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
                         transition-all duration-200 cursor-default"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`${c.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  <StatIcon statKey={s.key} />
                </div>
                <span className="text-[10px] font-mono tracking-[0.1em] uppercase text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  {s.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700 ease-out`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold tabular-nums ${c.text}`}>
                  {s.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
