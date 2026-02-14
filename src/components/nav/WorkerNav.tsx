import { NavLink } from "react-router";

const PLAIN_ITEMS = [
  { to: "/jobs", label: "仕事一覧" },
  { to: "/workers", label: "編集者一覧" },
] as const;

export default function WorkerNav() {
  return (
    <nav className="flex h-14 shrink-0 items-center border-b border-white/[0.06] bg-[#050505] px-4 sm:px-6">
      <NavLink
        to="/app/dashboard"
        className="mr-4 text-[15px] font-extrabold leading-none tracking-tight no-underline cursor-pointer"
      >
        boss<span className="text-neutral-600">.ai</span>
      </NavLink>
      <span className="mr-4 text-neutral-800">|</span>

      <div className="flex items-center gap-3 flex-1">
        {/* Plain nav items */}
        {PLAIN_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-[11px] font-medium tracking-wide transition-colors ${
                isActive
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        {/* 認証 — blue pill, monetization CTA */}
        <NavLink
          to="/app/verification"
          className={({ isActive }) =>
            `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold
             border transition-all duration-200 cursor-pointer no-underline
             active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/30
             ${
               isActive
                 ? "bg-blue-500/25 text-blue-200 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                 : `bg-blue-500/15 text-blue-300 border-blue-500/25
                    shadow-[0_0_0_1px_rgba(59,130,246,0.08)]
                    hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]
                    hover:-translate-y-px hover:bg-blue-500/20 hover:text-blue-200`
             }`
          }
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          認証
          <span className="ml-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 font-bold tracking-wider">
            PRO
          </span>
        </NavLink>

        {/* ダッシュボード — highlighted button, right-end */}
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold
             border transition-all duration-200 cursor-pointer no-underline
             active:scale-[0.97]
             ${
               isActive
                 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                 : "bg-white/[0.06] text-neutral-300 border-white/[0.10] hover:bg-white/[0.12] hover:text-white hover:shadow-md hover:shadow-white/5"
             }`
          }
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          ダッシュボード
        </NavLink>
      </div>
    </nav>
  );
}
