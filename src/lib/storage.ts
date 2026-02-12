import type { Brief } from "../types/brief";
import { uid } from "../types/brief";

/* ── Job types ── */

export type JobStatus = "draft" | "ready" | "in_progress" | "review" | "done";

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  brief: Brief;
  requirements: { assetsRequired: boolean };
}

/* ── Readiness logic ── */

export interface ReadinessResult {
  ready: boolean;
  filled: number;
  total: number;
  missing: string[];
}

const REQUIRED: { key: keyof Brief; label: string; check: (b: Brief) => boolean }[] = [
  { key: "purpose", label: "用途", check: (b) => !!b.purpose },
  { key: "duration", label: "尺", check: (b) => !!b.duration },
  { key: "target", label: "ターゲット", check: (b) => !!b.target },
  { key: "tones", label: "トーン", check: (b) => b.tones.length > 0 },
  { key: "concept", label: "コンセプト", check: (b) => !!b.concept },
  { key: "assets_url", label: "素材URL", check: (b) => !!b.assets_url },
];

export function checkReadiness(brief: Brief): ReadinessResult {
  const missing: string[] = [];
  let filled = 0;
  for (const r of REQUIRED) {
    if (r.check(brief)) {
      filled++;
    } else {
      missing.push(r.label);
    }
  }
  return { ready: missing.length === 0, filled, total: REQUIRED.length, missing };
}

export function computeStatus(brief: Brief, current: JobStatus): JobStatus {
  if (current === "in_progress" || current === "review" || current === "done") return current;
  return checkReadiness(brief).ready ? "ready" : "draft";
}

/* ── localStorage CRUD ── */

const JOBS_KEY = "boss-jobs";

function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: Job[]): void {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function getAllJobs(): Job[] {
  return loadJobs().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getJob(id: string): Job | null {
  return loadJobs().find((j) => j.id === id) ?? null;
}

export function createJob(brief: Brief): Job {
  const jobs = loadJobs();
  const status = checkReadiness(brief).ready ? "ready" : "draft";
  const job: Job = {
    id: uid(),
    createdAt: new Date().toISOString(),
    status,
    brief: { ...brief },
    requirements: { assetsRequired: true },
  };
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

export function updateJob(id: string, updates: Partial<Pick<Job, "brief" | "status">>): Job | null {
  const jobs = loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;

  const job = { ...jobs[idx] };
  if (updates.brief) {
    job.brief = { ...job.brief, ...updates.brief };
    job.status = computeStatus(job.brief, updates.status ?? job.status);
  }
  if (updates.status && !updates.brief) {
    job.status = updates.status;
  }
  jobs[idx] = job;
  saveJobs(jobs);
  return job;
}

export function deleteJob(id: string): void {
  const jobs = loadJobs().filter((j) => j.id !== id);
  saveJobs(jobs);
}
