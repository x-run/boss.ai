import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getJob, updateJob, deleteJob, checkReadiness } from "../lib/storage";
import type { Job, JobStatus } from "../lib/storage";

/* ── Status config ── */

const STATUS_STYLE: Record<JobStatus, { label: string; cls: string }> = {
  draft: {
    label: "下書き",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  ready: {
    label: "準備完了",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  in_progress: {
    label: "制作中",
    cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  review: {
    label: "レビュー",
    cls: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  done: {
    label: "完了",
    cls: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  },
};

const REQUIRED_LABELS: { key: string; label: string }[] = [
  { key: "purpose", label: "用途" },
  { key: "duration", label: "尺" },
  { key: "target", label: "ターゲット" },
  { key: "tones", label: "トーン" },
  { key: "concept", label: "コンセプト" },
  { key: "assets_url", label: "素材URL" },
];

const URL_RE = /^https?:\/\/.+/i;

/* ── Component ── */

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);

  /* asset input */
  const [assetUrl, setAssetUrl] = useState("");
  const [assetError, setAssetError] = useState("");
  const [saved, setSaved] = useState(false);

  const reload = useCallback(() => {
    if (!id) return;
    const j = getJob(id);
    if (!j) {
      setNotFound(true);
      return;
    }
    setJob(j);
    setAssetUrl(j.brief.assets_url);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSaveAsset = useCallback(() => {
    if (!job) return;
    const v = assetUrl.trim();
    if (v && !URL_RE.test(v)) {
      setAssetError("有効なURLを入力してください");
      return;
    }
    setAssetError("");
    const updated = updateJob(job.id, {
      brief: { ...job.brief, assets_url: v },
    });
    if (updated) {
      setJob(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [job, assetUrl]);

  const handleDelete = useCallback(() => {
    if (!job) return;
    if (!confirm("この案件を削除しますか？")) return;
    deleteJob(job.id);
    navigate("/jobs");
  }, [job, navigate]);

  /* ── Not found ── */

  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-500 mb-4">案件が見つかりません</p>
          <Link
            to="/jobs"
            className="text-[13px] text-emerald-400 hover:text-emerald-300 no-underline"
          >
            案件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Derived ── */

  const r = checkReadiness(job.brief);
  const pct = Math.round((r.filled / r.total) * 100);
  const st = STATUS_STYLE[job.status];
  const title =
    [job.brief.purpose, job.brief.duration, job.brief.target]
      .filter(Boolean)
      .join(" / ") || "無題のブリーフ";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* back link */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-300
                     no-underline transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          案件一覧
        </Link>

        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
              Job Detail
            </p>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          </div>
          <span
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${st.cls}`}
          >
            {st.label}
          </span>
        </div>

        {/* progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct === 100 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-500 shrink-0">
            {r.filled}/{r.total}
          </span>
        </div>

        {/* checklist */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <h2 className="text-[13px] font-semibold mb-4">必須チェックリスト</h2>
          <div className="space-y-3">
            {REQUIRED_LABELS.map(({ key, label }) => {
              const filled = !r.missing.includes(label);
              return (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${
                      filled
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-white/[0.03] border border-white/[0.08]"
                    }`}
                  >
                    {filled && (
                      <svg
                        className="w-3 h-3 text-emerald-400 animate-[fadeIn_0.3s_ease]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[13px] transition-colors ${
                      filled ? "text-neutral-300" : "text-neutral-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* brief summary */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <h2 className="text-[13px] font-semibold mb-4">ブリーフサマリ</h2>
          <div className="space-y-3">
            <SummaryRow label="用途" value={job.brief.purpose} />
            <SummaryRow label="尺" value={job.brief.duration} />
            <SummaryRow label="ターゲット" value={job.brief.target} />
            <SummaryRow
              label="トーン"
              value={job.brief.tones.length > 0 ? job.brief.tones.join(", ") : ""}
            />
            <SummaryRow label="コンセプト" value={job.brief.concept} />
            <SummaryRow label="その他" value={job.brief.details} />
          </div>
        </div>

        {/* asset URL input */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <h2 className="text-[13px] font-semibold mb-4">素材を追加</h2>
          <label className="block text-[11px] text-neutral-500 mb-2">
            素材共有リンク（Google Drive / Dropboxなど）
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={assetUrl}
              onChange={(e) => {
                setAssetUrl(e.target.value);
                setAssetError("");
              }}
              placeholder="https://drive.google.com/..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/[0.035] border border-white/[0.07]
                         text-white placeholder-neutral-700 focus:outline-none focus:border-emerald-500/40 transition"
            />
            <button
              onClick={handleSaveAsset}
              className="px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all
                         bg-white text-black hover:shadow-lg active:scale-[0.97]"
            >
              保存
            </button>
          </div>
          {assetError && (
            <p className="text-[11px] text-red-400 mt-2">{assetError}</p>
          )}
          {saved && (
            <p className="text-[11px] text-emerald-400 mt-2 animate-[fadeIn_0.3s_ease]">
              保存しました
            </p>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/brief/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold
                       no-underline transition-all
                       bg-white/[0.04] text-neutral-400 border border-white/[0.06]
                       hover:bg-white/[0.08] hover:text-white"
          >
            ブリーフを編集
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl text-[12px] text-neutral-700
                       hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="shrink-0 text-[11px] font-mono text-neutral-600 w-20">
        {label}
      </span>
      <span className={`text-[13px] ${value ? "text-neutral-300" : "text-neutral-800"}`}>
        {value || "—"}
      </span>
    </div>
  );
}
