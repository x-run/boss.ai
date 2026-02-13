import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { loadSession, saveSession, decodeJwtPayload } from "../lib/auth";
import { getWorkerByOwnerUserId } from "../lib/workers";
import { initializeAndRenderButton } from "../lib/googleIdentity";

export default function Login() {
  const nav = useNavigate();
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ── Already logged in? Redirect ── */
  useEffect(() => {
    const session = loadSession();
    if (session) {
      const existing = getWorkerByOwnerUserId(session.user.sub);
      if (existing) {
        nav(`/workers/${existing.id}`, { replace: true });
      } else {
        nav("/workers/new", { replace: true });
      }
      return;
    }
    setLoading(false);
  }, [nav]);

  /* ── Render Google button ── */
  useEffect(() => {
    if (loading) return;
    const container = btnRef.current;
    if (!container) return;

    initializeAndRenderButton(container, (credential) => {
      try {
        const user = decodeJwtPayload(credential);
        saveSession({
          provider: "google",
          idToken: credential,
          user,
          createdAt: Date.now(),
        });

        const existing = getWorkerByOwnerUserId(user.sub);
        if (existing) {
          nav(`/workers/${existing.id}`, { replace: true });
        } else {
          nav("/workers/new", { replace: true });
        }
      } catch {
        setError("認証に失敗しました。もう一度お試しください。");
      }
    }).catch(() => {
      setError("Google認証の読み込みに失敗しました。");
    });
  }, [loading, nav]);

  if (loading) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        {/* Card */}
        <div className="w-full max-w-md bg-white/[0.025] border border-white/[0.06] rounded-2xl p-8 text-center">
          {/* Logo */}
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">
            boss<span className="text-neutral-600">.ai</span>
          </h1>
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-neutral-600 mb-8">
            Worker Registration
          </p>

          {/* Description */}
          <p className="text-[13px] text-neutral-400 leading-relaxed mb-8">
            Googleアカウントでログインして、
            <br />
            編集者として登録を始めましょう。
          </p>

          {/* Google button container */}
          <div className="flex justify-center mb-6">
            <div ref={btnRef} />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-[12px] text-red-400 mt-4">{error}</p>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-neutral-700 mt-8">
            ログインすることで、プロフィール情報（名前・メールアドレス・プロフィール画像）が取得されます。
          </p>
        </div>
      </div>
    </div>
  );
}
