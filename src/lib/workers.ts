import { load, save } from "../storage/kv";

/* ── Types ── */

export type WorkerStatus = "available" | "busy" | "offline";

export type PlatformTag = "TikTok" | "Reels" | "YouTube" | "Ads";
export type ToolTag = "Premiere" | "CapCut" | "DaVinci" | "AfterEffects";
export type StrengthTag = "Hook" | "Captions" | "Color" | "BeatSync" | "Thumbnail";

export interface Capability {
  id: string;
  type: "video_edit";
  platforms: PlatformTag[];
  tools: ToolTag[];
  strengths: StrengthTag[];
  portfolioUrls: string[];
}

export interface Worker {
  id: string;
  createdAt: number;
  name: string;
  timezone: string;
  status: WorkerStatus;
  headline: string;
  capabilities: Capability[];
  ownerUserId?: string;
}

/* ── Constants ── */

const STORAGE_KEY = "boss-workers";

export const PLATFORMS: PlatformTag[] = ["TikTok", "Reels", "YouTube", "Ads"];
export const TOOLS: ToolTag[] = ["Premiere", "CapCut", "DaVinci", "AfterEffects"];
export const STRENGTHS: StrengthTag[] = ["Hook", "Captions", "Color", "BeatSync", "Thumbnail"];
export const TIMEZONES = [
  "Asia/Tokyo",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Shanghai",
  "Asia/Singapore",
];

/* ── Helpers ── */

function uid(): string {
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Readiness ── */

interface ReadinessField {
  label: string;
  check: (w: Partial<Worker> & { capability?: Partial<Capability> }) => boolean;
}

const REQUIRED_FIELDS: ReadinessField[] = [
  { label: "Name", check: (w) => !!w.name?.trim() },
  { label: "Status", check: (w) => !!w.status },
  { label: "Platforms", check: (w) => (w.capability?.platforms?.length ?? 0) > 0 },
  { label: "Tools", check: (w) => (w.capability?.tools?.length ?? 0) > 0 },
  { label: "Strengths", check: (w) => (w.capability?.strengths?.length ?? 0) > 0 },
];

export function checkWorkerReadiness(
  worker: Partial<Worker> & { capability?: Partial<Capability> },
): { pct: number; missing: string[] } {
  const missing: string[] = [];
  for (const f of REQUIRED_FIELDS) {
    if (!f.check(worker)) missing.push(f.label);
  }
  const filled = REQUIRED_FIELDS.length - missing.length;
  return {
    pct: Math.round((filled / REQUIRED_FIELDS.length) * 100),
    missing,
  };
}

/* ── CRUD ── */

export function getAllWorkers(): Worker[] {
  return load<Worker[]>(STORAGE_KEY) ?? [];
}

export function getWorker(id: string): Worker | null {
  return getAllWorkers().find((w) => w.id === id) ?? null;
}

export function getWorkerByOwnerUserId(sub: string): Worker | null {
  return getAllWorkers().find((w) => w.ownerUserId === sub) ?? null;
}

export function createWorker(
  data: Omit<Worker, "id" | "createdAt">,
): Worker {
  const worker: Worker = {
    ...data,
    id: uid(),
    createdAt: Date.now(),
  };
  const all = getAllWorkers();
  all.unshift(worker);
  save(STORAGE_KEY, all);
  return worker;
}

export function updateWorker(
  id: string,
  updates: Partial<Omit<Worker, "id" | "createdAt">>,
): Worker | null {
  const all = getAllWorkers();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  save(STORAGE_KEY, all);
  return all[idx];
}

export function deleteWorker(id: string): void {
  const all = getAllWorkers().filter((w) => w.id !== id);
  save(STORAGE_KEY, all);
}
