import type { SkillEntry } from "../../lib/workerProfile";

const COLOR_MAP: Record<string, { bar: string; text: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-400" },
  blue: { bar: "bg-blue-500", text: "text-blue-400" },
  purple: { bar: "bg-purple-500", text: "text-purple-400" },
  amber: { bar: "bg-amber-500", text: "text-amber-400" },
  cyan: { bar: "bg-cyan-500", text: "text-cyan-400" },
  rose: { bar: "bg-rose-500", text: "text-rose-400" },
};

interface Props {
  skills: SkillEntry[];
}

export default function SkillsPanel({ skills }: Props) {
  return (
    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
      <h2 className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-5">
        Skills
      </h2>
      <div className="space-y-3">
        {skills.map((skill) => {
          const c = COLOR_MAP[skill.color] ?? COLOR_MAP.emerald;
          return (
            <div key={skill.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-neutral-300 group-hover:text-white transition-colors">
                  {skill.name}
                </span>
                <span className={`text-[10px] font-mono tabular-nums ${c.text}`}>
                  {skill.proficiency}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
