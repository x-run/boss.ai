import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import "../styles/landing.css";
import WorkerCarousel from "../components/landing/WorkerCarousel";
import { loadSession } from "../lib/auth";

/* ================================================================
   Helper: useInView — fires once when element enters viewport
   ================================================================ */

function useInView(threshold = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ================================================================
   Landing Page — "Cinematic Command"
   ================================================================ */

export default function Landing() {
  /* ── state ── */
  const [loaded, setLoaded] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  /* ── auth check ── */
  useEffect(() => {
    setLoggedIn(!!loadSession());
  }, []);

  /* ── section visibility ── */
  const workflow = useInView();
  const problem = useInView();
  const concept = useInView();

  /* ── refs for smooth scroll ── */
  const workflowEl = useRef<HTMLElement>(null);
  const problemEl = useRef<HTMLElement>(null);
  const conceptEl = useRef<HTMLElement>(null);

  /* ── loader + hero reveal ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      setTimeout(() => setHeroReady(true), 200);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  /* ── nav scroll detection ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── smooth scroll to anchor ── */
  const scrollTo = useCallback(
    (el: React.RefObject<HTMLElement | null>) => {
      el.current?.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  const vis = heroReady ? "is-visible" : "";

  return (
    <div className="landing-page">
      {/* ── LOADER ── */}
      <div className={`lp-loader ${loaded ? "loaded" : ""}`}>
        <span className="loader-logo">
          BOSS<span style={{ color: "var(--text-dim)" }}>.AI</span>
        </span>
      </div>

      {/* ── NAVIGATION ── */}
      <nav
        className={`lp-nav fixed top-0 w-full z-50 border-b border-transparent ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm font-extrabold tracking-[0.05em] uppercase leading-none no-underline text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BOSS<span className="text-[var(--text-dim)]">.AI</span>
          </Link>
          <div className="flex items-center gap-5 md:gap-7">
            <Link to="/workers" className="nav-link hidden sm:inline">
              探す
            </Link>
            <Link to="/jobs" className="nav-link hidden sm:inline">
              仕事一覧
            </Link>
            <Link to="/clients" className="nav-link hidden md:inline">
              仕事を依頼する
            </Link>
            <Link to="/editors" className="nav-link hidden md:inline">
              編集者向け
            </Link>
            <Link
              to={loggedIn ? "/app/dashboard" : "/login"}
              className="nav-cta"
            >
              {loggedIn ? "ダッシュボード" : "登録 / ログイン"}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-grid px-6 md:px-10 pt-16 relative">
        {/* Gradient mesh background */}
        <div className="hero-mesh" aria-hidden="true" />

        {/* Vertical side text */}
        <div className="hero-vertical" aria-hidden="true">
          DIRECT
        </div>

        {/* Main content — left aligned */}
        <div className="relative z-10 flex flex-col justify-center max-w-[1280px] mx-auto w-full py-32 md:py-0">
          {/* Badge */}
          <div className="reveal-line mb-10">
            <div className={`reveal-text reveal-d1 ${vis}`}>
              <span className="hero-badge">
                <span className="badge-dot" />
                動画制作の構造を変える
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="hero-headline mb-8">
            <span className="reveal-line">
              <span
                className={`reveal-text reveal-d2 hero-headline-accent ${vis}`}
              >
                AIが雇い、
              </span>
            </span>
            <span className="reveal-line">
              <span
                className={`reveal-text reveal-d3 hero-headline-white ${vis}`}
              >
                人間が
                <span className="slot">
                  <span className="slot-track">
                    <span className="slot-item">編集する。</span>
                    <span className="slot-item">創造する。</span>
                    <span className="slot-item">表現する。</span>
                    <span className="slot-item">革新する。</span>
                    <span className="slot-item">編集する。</span>
                  </span>
                </span>
              </span>
            </span>
          </h1>

          {/* Subcopy */}
          <div className="reveal-line mb-3">
            <p className={`reveal-text reveal-d4 hero-sub ${vis}`}>
              依頼主はAIと要件を固め、AIがクリエイターに発注し一次評価。
              <br className="hidden sm:block" />
              依頼主が最終確認するだけで、動画が届く。
            </p>
          </div>

          {/* Tagline */}
          <div className="reveal-line mb-14">
            <p className={`reveal-text reveal-d5 hero-tagline ${vis}`}>
              AI directs. Humans craft. You approve.
            </p>
          </div>

          {/* CTAs */}
          <div className="reveal-line">
            <div
              className={`reveal-text reveal-d6 flex flex-col sm:flex-row items-start gap-4 ${vis}`}
            >
              <Link to="/brief/new" className="cta-primary">
                <span className="relative z-10">ブリーフを作成する</span>
                <svg
                  className="relative z-10 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link to="/login" className="cta-ghost">
                編集者として登録する
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <button
                onClick={() => scrollTo(workflowEl)}
                className="cta-ghost"
              >
                仕組みを見る
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="scroll-indicator" />
        </div>
      </section>

      <div className="lp-divider max-w-[1280px] mx-auto" />

      {/* ── WORKFLOW ── */}
      <section
        ref={workflowEl}
        className="py-28 sm:py-40 px-6 md:px-10 relative"
      >
        <div ref={workflow.ref} className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div
            className={`mb-20 sr ${workflow.visible ? "is-visible" : ""}`}
          >
            <p className="mono-label mb-5" style={{ color: "var(--accent-dim)" }}>
              Process
            </p>
            <h2 className="section-header mb-6">
              4ステップで、
              <span style={{ color: "var(--text-muted)" }}>自律的に回る。</span>
            </h2>
            <p
              className="text-sm md:text-base max-w-lg leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              発注から納品まで。AIがプロジェクトを統括し、人間が品質を仕上げる。
            </p>
          </div>

          {/* Timeline */}
          <div className="workflow-timeline sr-stagger">
            {/* Pulse animation line */}
            <div className="workflow-pulse" aria-hidden="true" />

            {/* Step 1 */}
            <div
              className={`workflow-step sr ${workflow.visible ? "is-visible" : ""}`}
            >
              <div className="workflow-num">01</div>
              <span className="workflow-role workflow-role--ai">
                AI Director
              </span>
              <h3 className="workflow-title">企画・分解</h3>
              <p className="workflow-desc">
                依頼を分析し、構成・シーン・テロップを自動設計。タスクを生成し最適なクリエイターを選定。
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`workflow-step sr ${workflow.visible ? "is-visible" : ""}`}
            >
              <div className="workflow-num">02</div>
              <span className="workflow-role workflow-role--human">
                Human Editor
              </span>
              <h3 className="workflow-title">編集・調整</h3>
              <p className="workflow-desc">
                人間のクリエイターがカット編集、色補正、音声調整など品質に関わる領域を磨き上げる。
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`workflow-step sr ${workflow.visible ? "is-visible" : ""}`}
            >
              <div className="workflow-num">03</div>
              <span className="workflow-role workflow-role--ai">
                AI Review
              </span>
              <h3 className="workflow-title">検品・一次評価</h3>
              <p className="workflow-desc">
                完成物をAIが品質チェック。ガイドラインとの整合性を検証し、修正点を自動フィードバック。
              </p>
            </div>

            {/* Step 4 */}
            <div
              className={`workflow-step sr ${workflow.visible ? "is-visible" : ""}`}
            >
              <div className="workflow-num">04</div>
              <span className="workflow-role workflow-role--client">
                Client
              </span>
              <h3 className="workflow-title">最終確認・納品</h3>
              <p className="workflow-desc">
                依頼主が最終確認し承認。修正があればAIが即座にタスクを再分解し、サイクルを回す。
              </p>
            </div>
          </div>

          {/* Flow summary */}
          <div
            className={`mt-20 text-center sr ${workflow.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".4s" }}
          >
            <div className="flow-pill">
              <span style={{ color: "var(--accent)" }}>AI</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                style={{ color: "var(--text-dim)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span style={{ color: "var(--text)" }}>人間</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                style={{ color: "var(--text-dim)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span style={{ color: "var(--accent)" }}>AI</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                style={{ color: "var(--text-dim)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span style={{ color: "#FFC857" }}>依頼主</span>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-[1280px] mx-auto" />

      {/* ── EDITORS CAROUSEL ── */}
      <WorkerCarousel />

      <div className="lp-divider max-w-[1280px] mx-auto" />

      {/* ── PROBLEM → SOLUTION ── */}
      <section
        ref={problemEl}
        className="py-28 sm:py-40 px-6 md:px-10"
      >
        <div ref={problem.ref} className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div
            className={`mb-20 sr ${problem.visible ? "is-visible" : ""}`}
          >
            <p className="mono-label mb-5" style={{ color: "rgba(255, 59, 59, 0.5)" }}>
              Problem &amp; Solution
            </p>
            <h2 className="section-header mb-6">
              構造で、
              <span style={{ color: "var(--text-muted)" }}>課題を解く。</span>
            </h2>
          </div>

          {/* Problem / Solution pairs */}
          <div className="ps-grid sr-stagger">
            {/* Pair 1 */}
            <div
              className={`ps-card ps-card--problem sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Problem</p>
              <h3 className="ps-title">ディレクションに時間が消える</h3>
              <p className="ps-body">
                クリエイター選定、指示書作成、進捗管理。動画の中身より「管理業務」にリソースが取られる。
              </p>
            </div>
            <div
              className={`ps-card ps-card--solution sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Solution</p>
              <h3 className="ps-title">AIが管理を自動化</h3>
              <p className="ps-body">
                AIが要件定義からタスク分解、人材アサインまでを自動化。依頼主は「確認するだけ」に。
              </p>
            </div>

            <div className="ps-row-divider" />

            {/* Pair 2 */}
            <div
              className={`ps-card ps-card--problem sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Problem</p>
              <h3 className="ps-title">品質がばらつく</h3>
              <p className="ps-body">
                担当者の力量次第でアウトプットが変わる。AI単体では「最後の1%」が仕上がらない。
              </p>
            </div>
            <div
              className={`ps-card ps-card--solution sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Solution</p>
              <h3 className="ps-title">二重構造で品質担保</h3>
              <p className="ps-body">
                AIが一次品質を担保し、人間の職人が仕上げる二重構造。属人性を排除しつつ、クオリティを維持。
              </p>
            </div>

            <div className="ps-row-divider" />

            {/* Pair 3 */}
            <div
              className={`ps-card ps-card--problem sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Problem</p>
              <h3 className="ps-title">本数が増えるとスケールしない</h3>
              <p className="ps-body">
                人に依存する制作フローは、本数に比例してコストが線形に膨らむ。
              </p>
            </div>
            <div
              className={`ps-card ps-card--solution sr-clip ${problem.visible ? "is-visible" : ""}`}
            >
              <p className="ps-label">Solution</p>
              <h3 className="ps-title">仕組みでスケール</h3>
              <p className="ps-body">
                AIが並列でプロジェクトを統括。10本でも100本でも、管理コストはほぼ一定。仕組みで解く。
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-[1280px] mx-auto" />

      {/* ── CONCEPT ── */}
      <section
        ref={conceptEl}
        className="py-28 sm:py-40 px-6 md:px-10 relative overflow-hidden"
      >
        <div className="concept-glow" aria-hidden="true" />

        <div
          ref={concept.ref}
          className="relative z-10 max-w-[1280px] mx-auto"
        >
          <div className={`sr ${concept.visible ? "is-visible" : ""}`}>
            <p
              className="mono-label mb-16"
              style={{ color: "var(--accent-dim)" }}
            >
              Vision
            </p>
            <blockquote className="concept-quote mb-12">
              <span style={{ color: "var(--text)" }}>AIが、ボスになる。</span>
              <br />
              <span style={{ color: "var(--text-muted)" }}>
                人間は、職人になる。
              </span>
            </blockquote>
          </div>

          <div
            className={`sr ${concept.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".15s" }}
          >
            <p
              className="text-base sm:text-lg leading-[2] max-w-2xl mb-20"
              style={{ color: "var(--text-muted)" }}
            >
              プロジェクト管理、タスク分解、品質管理はAIが担う。
              <br />
              人間は、クリエイティブという
              <span
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                「最も人間的な仕事」
              </span>
              に集中する。
            </p>
          </div>

          <div
            className={`sr ${concept.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".3s" }}
          >
            <div className="definition-box max-w-lg">
              <p className="mono-label mb-3" style={{ color: "var(--text-dim)" }}>
                Definition
              </p>
              <p
                className="text-[15px] sm:text-base leading-[1.8] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="font-bold" style={{ color: "var(--text)" }}>
                  boss.ai
                </span>
                <span className="mx-2" style={{ color: "var(--text-dim)" }}>
                  =
                </span>
                AIがディレクションし、人間がクラフトする動画制作プラットフォーム
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-[1280px] mx-auto" />

      {/* ── FOOTER ── */}
      <footer className="lp-footer py-16 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="lp-footer-logo">
            BOSS<span style={{ color: "var(--text-dim)" }}>.AI</span>
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
          >
            &copy; 2025 boss.ai &mdash; All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
