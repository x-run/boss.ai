import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { loadSession } from "../lib/auth";
import { findWorkerByAuth } from "../lib/workers";
import WorkerDetail from "./WorkerDetail";

export default function AppProfile() {
  const nav = useNavigate();
  const [workerId, setWorkerId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) { nav("/login", { replace: true }); return; }
    const w = findWorkerByAuth("google", s.user.sub);
    if (!w) { nav("/workers/new", { replace: true }); return; }
    setWorkerId(w.id);
  }, [nav]);

  if (!workerId) return null;
  return <WorkerDetail workerId={workerId} />;
}
