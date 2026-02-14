export default function Verification() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                        flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-2">
          Verification
        </p>
        <h1 className="text-lg font-bold tracking-tight text-white mb-3">認証マーク取得</h1>
        <p className="text-[13px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
          本人確認・スキル認証を完了すると、プロフィールに認証バッジが付与されます。
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl
                        bg-white/[0.03] border border-white/[0.06] text-[12px] text-neutral-500">
          <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
