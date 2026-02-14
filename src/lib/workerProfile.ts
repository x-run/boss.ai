import type { Worker } from "./workers";

/* ── Seeded PRNG (mulberry32) ── */

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash + c) | 0;
  }
  return hash;
}

/* ── Types ── */

export interface StatEntry {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface SkillEntry {
  name: string;
  proficiency: number;
  color: string;
}

export interface BadgeEntry {
  label: string;
  icon: string;
  color: string;
  glow: string;
}

export interface EquipmentSlot {
  slot: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
}

export interface ActivityItem {
  label: string;
  xpDelta: number;
  timeAgo: string;
  icon: string;
}

export type EditorClass = "Cutter" | "Colorist" | "Motion" | "Sound";

export interface DerivedProfile {
  level: number;
  xpProgress: number;
  xpDelta: number;
  editorClass: EditorClass;
  stats: StatEntry[];
  skills: SkillEntry[];
  badges: BadgeEntry[];
  equipment: EquipmentSlot[];
  activityLog: ActivityItem[];
}

/* ── Constants ── */

const EDITOR_CLASSES: EditorClass[] = ["Cutter", "Colorist", "Motion", "Sound"];

const CLASS_ICONS: Record<EditorClass, string> = {
  Cutter: "scissors",
  Colorist: "palette",
  Motion: "zap",
  Sound: "headphones",
};

const STAT_DEFS: { key: string; label: string; color: string }[] = [
  { key: "speed", label: "Speed", color: "emerald" },
  { key: "quality", label: "Quality", color: "blue" },
  { key: "consistency", label: "Consistency", color: "purple" },
  { key: "communication", label: "Communication", color: "cyan" },
  { key: "reliability", label: "Reliability", color: "amber" },
  { key: "taste", label: "Taste", color: "rose" },
];

const BADGE_POOL: { label: string; icon: string; color: string; glow: string }[] = [
  { label: "Fast Turnaround", icon: "bolt", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", glow: "shadow-amber-500/20" },
  { label: "Ads Specialist", icon: "target", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", glow: "shadow-blue-500/20" },
  { label: "Luxury Tone", icon: "gem", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", glow: "shadow-purple-500/20" },
  { label: "Hook Master", icon: "magnet", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", glow: "shadow-rose-500/20" },
  { label: "Beat Sync Pro", icon: "music", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", glow: "shadow-cyan-500/20" },
  { label: "Color Grading", icon: "paintbrush", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", glow: "shadow-orange-500/20" },
  { label: "Viral Creator", icon: "flame", color: "text-red-400 bg-red-500/10 border-red-500/20", glow: "shadow-red-500/20" },
  { label: "Caption King", icon: "type", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", glow: "shadow-emerald-500/20" },
];

const EQUIPMENT_POOL: { slot: string; name: string; icon: string }[] = [
  { slot: "Main Tool", name: "Premiere Pro", icon: "film" },
  { slot: "Sub Tool", name: "After Effects", icon: "layers" },
  { slot: "Audio", name: "Logic Pro", icon: "headphones" },
  { slot: "Plugin", name: "Magic Bullet", icon: "sparkles" },
  { slot: "Main Tool", name: "DaVinci Resolve", icon: "film" },
  { slot: "Sub Tool", name: "CapCut Pro", icon: "smartphone" },
  { slot: "Audio", name: "Audition", icon: "headphones" },
  { slot: "Plugin", name: "Red Giant", icon: "sparkles" },
];

const RARITIES: EquipmentSlot["rarity"][] = ["common", "rare", "epic", "legendary"];

const ACTIVITY_POOL: { label: string; icon: string }[] = [
  { label: "Job 納品完了", icon: "check-circle" },
  { label: "クライアント高評価", icon: "star" },
  { label: "スキル認定テスト合格", icon: "award" },
  { label: "連続3日ログイン", icon: "calendar" },
  { label: "初回 Job 完了", icon: "flag" },
  { label: "リピートクライアント獲得", icon: "repeat" },
  { label: "AI品質スコア 90+", icon: "trending-up" },
  { label: "素材アップロード完了", icon: "upload" },
];

const TIME_AGO_OPTIONS = [
  "2分前", "15分前", "1時間前", "3時間前", "昨日", "2日前", "3日前", "1週間前",
];

/* ── Derive ── */

export function deriveProfile(worker: Worker): DerivedProfile {
  const rng = mulberry32(hashString(worker.id));

  const randInt = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;

  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Level & XP
  const level = randInt(5, 42);
  const xpProgress = randInt(10, 95);
  const xpDelta = randInt(15, 80);

  // Editor class
  const editorClass = pick(EDITOR_CLASSES);

  // Stats (base 40-95, seeded)
  const stats: StatEntry[] = STAT_DEFS.map((s) => ({
    ...s,
    value: randInt(40, 95),
  }));

  // Skills from worker capabilities + generated
  const cap = worker.capabilities[0];
  const skillNames: string[] = [];
  if (cap) {
    skillNames.push(...cap.platforms);
    skillNames.push(...cap.tools);
    skillNames.push(...cap.strengths);
  }
  if (skillNames.length === 0) {
    skillNames.push("Editing", "Color", "Transitions", "Pacing");
  }
  const skills: SkillEntry[] = skillNames.map((name) => {
    const colors = ["emerald", "blue", "purple", "amber", "cyan", "rose"];
    return {
      name,
      proficiency: randInt(30, 98),
      color: pick(colors),
    };
  });

  // Badges (3-5)
  const badgeCount = randInt(3, 5);
  const badges = shuffle([...BADGE_POOL]).slice(0, badgeCount);

  // Equipment (4 slots)
  const eqShuffled = shuffle([...EQUIPMENT_POOL]);
  const seenSlots = new Set<string>();
  const equipment: EquipmentSlot[] = [];
  for (const eq of eqShuffled) {
    if (seenSlots.has(eq.slot)) continue;
    seenSlots.add(eq.slot);
    equipment.push({
      ...eq,
      rarity: pick(RARITIES),
    });
    if (equipment.length >= 4) break;
  }

  // Activity log (5 entries)
  const activityShuffled = shuffle([...ACTIVITY_POOL]);
  const activityLog: ActivityItem[] = activityShuffled.slice(0, 5).map((a, i) => ({
    ...a,
    xpDelta: randInt(10, 60),
    timeAgo: TIME_AGO_OPTIONS[Math.min(i, TIME_AGO_OPTIONS.length - 1)],
  }));

  return {
    level,
    xpProgress,
    xpDelta,
    editorClass,
    stats,
    skills,
    badges,
    equipment,
    activityLog,
  };
}

export { CLASS_ICONS };
