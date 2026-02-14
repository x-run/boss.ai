import { NavLink, Outlet } from "react-router";

const links = [
  { to: "/brief/new", label: "ブリーフ作成" },
  { to: "/jobs", label: "案件一覧" },
  { to: "/workers", label: "ワーカー" },
  { to: "/browse", label: "編集者を探す" },
  { to: "/login", label: "ワーカー登録" },
] as const;

export default function Layout() {
  return (
    <div className="flex h-full flex-col">
      {/* nav */}
      <nav className="flex h-14 shrink-0 items-center border-b border-white/[0.06] bg-[#050505]/80 px-4 backdrop-blur-xl sm:px-6">
        <span className="mr-4 text-[15px] font-extrabold leading-none tracking-tight">
          boss<span className="text-neutral-600">.ai</span>
        </span>
        <span className="mr-4 text-neutral-800">|</span>
        <div className="flex items-center gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[11px] font-medium tracking-wide transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-600 hover:text-neutral-300"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* page */}
      <Outlet />
    </div>
  );
}
