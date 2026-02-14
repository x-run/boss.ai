import { Link } from "react-router";

const STEPS = [
  {
    num: "01",
    title: "ブリーフを作成",
    desc: "AIチャットで要件を整理。動画の目的・ターゲット・トーンを対話形式で固めます。",
  },
  {
    num: "02",
    title: "AIが管理・進行",
    desc: "タスク分解、クリエイター選定、品質チェックをAIが自動で統括。あなたは待つだけ。",
  },
  {
    num: "03",
    title: "確認して納品",
    desc: "完成物をプレビューし、承認するだけ。修正があればAIが即座にサイクルを回します。",
  },
] as const;

export default function Clients() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
            For Clients
          </p>
          <h1 className="text-xl font-bold tracking-tight mb-3">
            仕事を依頼する
          </h1>
          <p className="text-[13px] text-neutral-500 leading-relaxed max-w-lg">
            AIがプロジェクトを管理し、プロの編集者が動画を仕上げる。
            あなたは要件を伝えて、最終確認するだけです。
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6
                         hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-[28px] font-extrabold text-white/[0.06] leading-none shrink-0 font-mono">
                  {s.num}
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Link
            to="/brief/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold
                       bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline"
          >
            ブリーフを作成する
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium
                       bg-white/[0.04] text-neutral-400 border border-white/[0.06]
                       hover:bg-white/[0.08] hover:text-white transition-all no-underline"
          >
            案件一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
