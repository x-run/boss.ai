import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { loadSession } from "../lib/auth";
import { findWorkerByAuth } from "../lib/workers";
import WorkerNav from "../components/nav/WorkerNav";

export default function WorkerLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) { nav("/login", { replace: true }); return; }
    const w = findWorkerByAuth("google", s.user.sub);
    if (!w) { nav("/workers/new", { replace: true }); return; }
    setReady(true);
  }, [nav]);

  if (!ready) return null;

  return (
    <div className="flex h-full flex-col">
      <WorkerNav />
      <Outlet />
    </div>
  );
}
