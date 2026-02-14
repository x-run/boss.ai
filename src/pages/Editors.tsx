import { Link } from "react-router";

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "案件を自動で獲得",
    desc: "AIがスキルマッチングで最適な案件をアサイン。営業活動は不要。",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "スキルを可視化",
    desc: "Speed, Quality, Consistency など6軸のステータスであなたの実力がクライアントに伝わる。",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
      </svg>
    ),
    title: "RPGスタイルのプロフィール",
    desc: "レベル、バッジ、装備スロット。ゲーム感覚で成長を実感できるプロフィールシステム。",
  },
] as const;

export default function Editors() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-1">
            For Editors
          </p>
          <h1 className="text-xl font-bold tracking-tight mb-3">
            編集者として参加する
          </h1>
          <p className="text-[13px] text-neutral-500 leading-relaxed max-w-lg">
            AIがディレクション、あなたはクリエイティブに集中。
            boss.ai で「最も人間的な仕事」に没頭しよう。
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-12">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6
                         hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15
                                flex items-center justify-center shrink-0 text-emerald-400">
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white mb-1">{b.title}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold
                       bg-white text-black hover:shadow-lg active:scale-[0.97] transition-all no-underline"
          >
            編集者として登録する
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
          <Link
            to="/workers"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium
                       bg-white/[0.04] text-neutral-400 border border-white/[0.06]
                       hover:bg-white/[0.08] hover:text-white transition-all no-underline"
          >
            編集者一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
