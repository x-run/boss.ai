import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { loadSession, type Session } from "../lib/auth";
import {
  findWorkerByAuth,
  updateWorker,
  type Worker,
  type Gender,
  type Socials,
  type WorkerStatus,
} from "../lib/workers";
import { getAllJobs } from "../lib/storage";

/* ── Constants ── */

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "na", label: "未設定" },
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
];

const STATUS_CFG: Record<WorkerStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  available: { label: "Available", dot: "bg-emerald-400", bg: "bg-emerald-500/12", text: "text-emerald-400", border: "border-emerald-500/25" },
  busy: { label: "Busy", dot: "bg-amber-400", bg: "bg-amber-500/12", text: "text-amber-400", border: "border-amber-500/25" },
  offline: { label: "Offline", dot: "bg-neutral-500", bg: "bg-neutral-500/12", text: "text-neutral-400", border: "border-neutral-500/25" },
};

type TabId = "profile" | "skills" | "social";
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  },
  {
    id: "skills",
    label: "Skills",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
  },
  {
    id: "social",
    label: "Social Links",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.182-5.055a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  },
];

const SOCIAL_FIELDS: { key: keyof Socials; label: string; placeholder: string; icon: React.ReactNode }[] = [
  {
    key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/username",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
  },
  {
    key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
  {
    key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username",
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    key: "website", label: "Website", placeholder: "https://example.com",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  },
];

/* ── Helpers ── */

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

interface FormState {
  name: string;
  headline: string;
  bio: string;
  gender: Gender;
  locationText: string;
  status: WorkerStatus;
  skills: string[];
  socials: Socials;
  avatarUrl: string;
}

function workerToForm(w: Worker): FormState {
  return {
    name: w.name,
    headline: w.headline,
    bio: w.bio ?? "",
    gender: w.gender ?? "na",
    locationText: w.locationText ?? "",
    status: w.status,
    skills: w.skills ?? [],
    socials: w.socials ?? {},
    avatarUrl: w.avatarUrl ?? "",
  };
}

function calcCompletion(f: FormState): number {
  const checks = [
    !!f.name.trim(),
    !!f.headline.trim(),
    !!f.bio.trim(),
    !!f.avatarUrl,
    f.skills.length > 0,
    Object.values(f.socials).some((v) => v?.trim()),
    !!f.locationText.trim(),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ── Main component ── */

export default function Dashboard() {
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [checked, setChecked] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [tab, setTab] = useState<TabId>("profile");
  const [skillInput, setSkillInput] = useState("");
  const [toast, setToast] = useState(false);
  const [socialErrors, setSocialErrors] = useState<Partial<Record<keyof Socials, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) { nav("/login", { replace: true }); return; }
    setSession(s);
    const w = findWorkerByAuth("google", s.user.sub);
    if (!w) { nav("/workers/new", { replace: true }); return; }
    setWorker(w);
    setForm(workerToForm(w));
    setChecked(true);
  }, [nav]);

  const completion = useMemo(() => form ? calcCompletion(form) : 0, [form]);

  if (!checked || !session || !worker || !form) return null;

  const set = (patch: Partial<FormState>) => setForm((f) => f ? { ...f, ...patch } : f);
  const sc = STATUS_CFG[form.status];

  const setSocial = (key: keyof Socials, value: string) => {
    set({ socials: { ...form.socials, [key]: value } });
    if (value && !isValidUrl(value)) {
      setSocialErrors((e) => ({ ...e, [key]: "有効なURLを入力してください" }));
    } else {
      setSocialErrors((e) => { const next = { ...e }; delete next[key]; return next; });
    }
  };

  const addSkill = () => {
    const t = skillInput.trim();
    if (!t || form.skills.includes(t)) { setSkillInput(""); return; }
    set({ skills: [...form.skills, t] });
    setSkillInput("");
  };

  const removeSkill = (idx: number) => set({ skills: form.skills.filter((_, i) => i !== idx) });

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const hasSocialErrors = Object.keys(socialErrors).length > 0;

  const handleSave = () => {
    if (hasSocialErrors || !form.name.trim()) return;
    const cleanSocials: Socials = {};
    for (const k of Object.keys(form.socials) as (keyof Socials)[]) {
      if (form.socials[k]?.trim()) cleanSocials[k] = form.socials[k]!.trim();
    }
    updateWorker(worker.id, {
      name: form.name.trim(),
      headline: form.headline.trim(),
      bio: form.bio.trim() || undefined,
      gender: form.gender,
      locationText: form.locationText.trim() || undefined,
      status: form.status,
      skills: form.skills.length > 0 ? form.skills : undefined,
      socials: Object.keys(cleanSocials).length > 0 ? cleanSocials : undefined,
      avatarUrl: form.avatarUrl || undefined,
      updatedAt: new Date().toISOString(),
    });
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const jobCount = getAllJobs().length;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">

        {/* ═══════════════════════════════════════════════
            DASHBOARD HEADER
        ═══════════════════════════════════════════════ */}
        <div className="mb-8">
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white">
            おかえりなさい、{form.name || "ワーカー"}さん
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            プロフィールを充実させて、最初の仕事を獲得しましょう。
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            METRIC CARDS (3-col grid)
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Profile Completeness */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                              flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
                Profile
              </p>
            </div>
            <p className={`text-[28px] font-bold tracking-tight font-mono ${completion === 100 ? "text-emerald-400" : "text-white"}`}>
              {completion}%
            </p>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out
                           ${completion === 100
                             ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                             : "bg-gradient-to-r from-emerald-500/80 to-emerald-400/60"
                           }`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-600 mt-2">プロフィール完成度</p>
          </div>

          {/* Card 2: Active Jobs */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20
                              flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
                Jobs
              </p>
            </div>
            <p className="text-[28px] font-bold tracking-tight font-mono text-white">
              {jobCount}
            </p>
            <p className="text-[11px] text-neutral-600 mt-2">公開中の案件</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300
                         transition-colors mt-2 no-underline cursor-pointer"
            >
              案件を見る
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {/* Card 3: Verification Status */}
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25
                              flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
                Verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                               text-[11px] font-semibold bg-neutral-500/12 text-neutral-400 border border-neutral-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                未認証
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 mt-3">認証を取得して信頼度UP</p>
            <Link
              to="/app/verification"
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 rounded-lg
                         text-[11px] font-semibold no-underline cursor-pointer
                         bg-blue-500/15 text-blue-300 border border-blue-500/25
                         hover:bg-blue-500/25 hover:text-blue-200
                         transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              認証を取得する
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            NEXT STEPS
        ═══════════════════════════════════════════════ */}
        {completion < 100 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 mb-8">
            <h2 className="text-[13px] font-semibold text-white mb-1">次にやること</h2>
            <p className="text-[11px] text-neutral-600 mb-4">プロフィールを充実させて案件獲得率を上げましょう</p>
            <div className="space-y-2">
              {!form.avatarUrl && (
                <NextStepItem
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>}
                  text="アバター画像をアップロード"
                  color="emerald"
                />
              )}
              {!form.bio.trim() && (
                <NextStepItem
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
                  text="自己紹介を書く"
                  color="emerald"
                />
              )}
              {form.skills.length === 0 && (
                <NextStepItem
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>}
                  text="スキルタグを追加する"
                  color="emerald"
                />
              )}
              <NextStepItem
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
                text="認証マークを取得する"
                color="blue"
                href="/app/verification"
              />
              <NextStepItem
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
                text="最初の仕事に応募する"
                color="amber"
                href="/jobs"
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            PROFILE EDITOR — Section divider
        ═══════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600">
            Edit Profile
          </p>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* ═══════════════════════════════════════════════
            PROFILE HERO BANNER
        ═══════════════════════════════════════════════ */}
        <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden mb-8">
          {/* gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-blue-500/[0.05]" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-white/[0.08] ring-offset-2 ring-offset-[#050505]">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                      <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100
                             flex items-center justify-center transition-all duration-200 cursor-pointer
                             backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />

                {/* online indicator */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${sc.bg} border ${sc.border}
                                flex items-center justify-center`}>
                  <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-white truncate">
                  {form.name || "名前未設定"}
                </h1>
                {form.headline && (
                  <p className="text-[13px] text-neutral-400 mt-1 truncate">{form.headline}</p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-3">
                  {/* status */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  {/* location */}
                  {form.locationText && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {form.locationText}
                    </span>
                  )}
                  {/* gender */}
                  {form.gender !== "na" && (
                    <span className="text-[11px] text-neutral-500">
                      {GENDER_OPTIONS.find((g) => g.value === form.gender)?.label}
                    </span>
                  )}
                </div>

                {/* skills preview */}
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
                    {form.skills.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-neutral-400 border border-white/[0.06]">
                        {s}
                      </span>
                    ))}
                    {form.skills.length > 5 && (
                      <span className="text-[10px] text-neutral-600">+{form.skills.length - 5}</span>
                    )}
                  </div>
                )}

                {/* social icons */}
                {Object.values(form.socials).some((v) => v?.trim()) && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    {SOCIAL_FIELDS.filter((s) => form.socials[s.key]?.trim()).map((s) => (
                      <a
                        key={s.key}
                        href={form.socials[s.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]
                                   flex items-center justify-center text-neutral-500
                                   hover:text-white hover:border-white/[0.15] hover:bg-white/[0.08]
                                   transition-all duration-200 cursor-pointer"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Completion bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-500">Profile completion</span>
                <span className={`text-[12px] font-semibold font-mono ${completion === 100 ? "text-emerald-400" : "text-neutral-400"}`}>
                  {completion}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out
                             ${completion === 100
                               ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                               : "bg-gradient-to-r from-emerald-500/80 to-emerald-400/60"
                             }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
              {completion < 100 && (
                <p className="text-[10px] text-neutral-600 mt-2">
                  {!form.avatarUrl && "アバター"}
                  {!form.avatarUrl && !form.bio.trim() && " · "}
                  {!form.bio.trim() && "自己紹介"}
                  {(!form.avatarUrl || !form.bio.trim()) && form.skills.length === 0 && " · "}
                  {form.skills.length === 0 && "スキル"}
                  {" を追加してプロフィールを完成させましょう"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TAB NAVIGATION
        ═══════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.06] -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[12px] font-medium transition-all duration-200
                         cursor-pointer select-none border-b-2 -mb-px
                         ${tab === t.id
                           ? "text-white border-emerald-400"
                           : "text-neutral-500 border-transparent hover:text-neutral-300 hover:border-white/[0.1]"
                         }`}
            >
              <span className={tab === t.id ? "text-emerald-400" : ""}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
            TAB CONTENT
        ═══════════════════════════════════════════════ */}

        {tab === "profile" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Basic info card */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-[13px] font-semibold text-white">Basic Information</h2>
                <p className="text-[11px] text-neutral-600 mt-0.5">公開プロフィールに表示される情報</p>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Display Name" required>
                    <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="表示名" className={INPUT_CLS} />
                  </FormField>
                  <FormField label="Location">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      <input type="text" value={form.locationText} onChange={(e) => set({ locationText: e.target.value })} placeholder="Tokyo, Japan" className={INPUT_CLS + " pl-10"} />
                    </div>
                  </FormField>
                </div>
                <FormField label="Headline">
                  <input type="text" value={form.headline} onChange={(e) => set({ headline: e.target.value })} placeholder="TikTok特化のショート動画エディター" className={INPUT_CLS} />
                </FormField>
                <FormField label="Bio">
                  <textarea value={form.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="あなたのスキルや経験を紹介してください…" rows={4} className={INPUT_CLS + " resize-none"} />
                  <p className="text-[10px] text-neutral-700 mt-1.5">{form.bio.length} / 500</p>
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Gender">
                    <select value={form.gender} onChange={(e) => set({ gender: e.target.value as Gender })} className={INPUT_CLS}>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value} className="bg-[#0a0a0a] text-white">{g.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <div className="flex gap-2">
                      {(["available", "busy"] as WorkerStatus[]).map((s) => {
                        const cfg = STATUS_CFG[s];
                        const active = form.status === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set({ status: s })}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold
                                       border transition-all duration-200 cursor-pointer select-none
                                       ${active
                                         ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                                         : "bg-white/[0.02] text-neutral-600 border-white/[0.06] hover:border-white/[0.12]"
                                       }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${active ? cfg.dot : "bg-neutral-700"}`} />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormField>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === "skills" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-[13px] font-semibold text-white">Skills & Tags</h2>
                <p className="text-[11px] text-neutral-600 mt-0.5">あなたのスキルをタグで追加して検索されやすくしましょう</p>
              </div>
              <div className="px-6 py-5">
                {/* input */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="スキルを入力して Enter で追加"
                      className={INPUT_CLS + " pl-10"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={!skillInput.trim()}
                    className={`px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer
                               ${skillInput.trim()
                                 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25"
                                 : "bg-white/[0.03] text-neutral-700 border border-white/[0.06] cursor-not-allowed"
                               }`}
                  >
                    追加
                  </button>
                </div>

                {/* chips */}
                {form.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                                   bg-white/[0.04] text-neutral-300 border border-white/[0.08]
                                   hover:border-white/[0.15] transition-all duration-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(i)}
                          className="w-4 h-4 rounded flex items-center justify-center
                                     text-neutral-600 hover:text-red-400 hover:bg-red-500/10
                                     transition-all duration-150 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl border border-dashed border-white/[0.06]">
                    <svg className="w-8 h-8 text-neutral-800 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                    <p className="text-[12px] text-neutral-600">スキルタグがありません</p>
                    <p className="text-[11px] text-neutral-700 mt-1">上の入力欄からスキルを追加してください</p>
                  </div>
                )}

                {/* suggested */}
                {form.skills.length < 3 && (
                  <div className="mt-5 pt-4 border-t border-white/[0.04]">
                    <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-700 mb-2">Suggested</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["動画編集", "モーショングラフィックス", "カラーグレーディング", "サウンドデザイン", "サムネイル制作", "Vlog", "縦型動画"].filter((s) => !form.skills.includes(s)).slice(0, 5).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set({ skills: [...form.skills, s] })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px]
                                     text-neutral-600 bg-white/[0.02] border border-white/[0.04]
                                     hover:text-neutral-300 hover:border-white/[0.1] hover:bg-white/[0.04]
                                     transition-all duration-200 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === "social" && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-[13px] font-semibold text-white">Social Links</h2>
                <p className="text-[11px] text-neutral-600 mt-0.5">SNS やウェブサイトのリンクを追加</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {SOCIAL_FIELDS.map((s) => (
                  <div key={s.key} className="space-y-1">
                    <label className="flex items-center gap-2 text-[11px] text-neutral-500 mb-1.5">
                      <span className="text-neutral-600">{s.icon}</span>
                      {s.label}
                    </label>
                    <input
                      type="text"
                      value={form.socials[s.key] ?? ""}
                      onChange={(e) => setSocial(s.key, e.target.value)}
                      placeholder={s.placeholder}
                      className={INPUT_CLS + (socialErrors[s.key] ? " !border-red-500/40 !focus:border-red-500/60" : "")}
                    />
                    {socialErrors[s.key] && (
                      <p className="text-[10px] text-red-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        {socialErrors[s.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          FLOATING SAVE BAR
      ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="border-t border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="text-[11px] text-neutral-600">
              {worker.updatedAt ? (
                <span className="font-mono">Last saved: {new Date(worker.updatedAt).toLocaleString("ja-JP")}</span>
              ) : (
                <span>未保存の変更があります</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim() || hasSocialErrors}
              className={`px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer
                         active:scale-[0.97]
                         ${!form.name.trim() || hasSocialErrors
                           ? "bg-white/[0.06] text-neutral-700 cursor-not-allowed"
                           : "bg-white text-black hover:shadow-lg hover:shadow-white/10"
                         }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-[fadeSlideUp_0.3s_ease-out]">
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25
                          backdrop-blur-xl shadow-lg shadow-emerald-500/10">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-[13px] font-semibold text-emerald-300">Saved</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

const INPUT_CLS = `w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]
                   text-[13px] text-white placeholder:text-neutral-700
                   focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.06]
                   transition-all duration-200`;

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-neutral-500 mb-1.5">
        {label} {required && <span className="text-red-400/70">*</span>}
      </label>
      {children}
    </div>
  );
}

const STEP_COLORS = {
  emerald: { icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", arrow: "text-emerald-500/40 group-hover:text-emerald-400" },
  blue:    { icon: "bg-blue-500/10 border-blue-500/20 text-blue-400",       arrow: "text-blue-500/40 group-hover:text-blue-400" },
  amber:   { icon: "bg-amber-500/10 border-amber-500/20 text-amber-400",    arrow: "text-amber-500/40 group-hover:text-amber-400" },
} as const;

function NextStepItem({ icon, text, color, href }: { icon: React.ReactNode; text: string; color: keyof typeof STEP_COLORS; href?: string }) {
  const c = STEP_COLORS[color];
  const inner = (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl
                    bg-white/[0.02] border border-white/[0.06]
                    hover:border-white/[0.12] hover:bg-white/[0.04]
                    transition-all duration-200 cursor-pointer">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <span className="flex-1 text-[12px] text-neutral-400 group-hover:text-neutral-200 transition-colors">
        {text}
      </span>
      <svg className={`w-4 h-4 shrink-0 transition-colors ${c.arrow}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  );
  if (href) return <Link to={href} className="no-underline">{inner}</Link>;
  return inner;
}
