import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import "../styles/landing.css";

/* ================================================================
   Helper: useInView — fires once when element is 50% visible
   ================================================================ */

function useInView(threshold = 0.5) {
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
   Landing Page
   ================================================================ */

export default function Landing() {
  /* ── state ── */
  const [loaded, setLoaded] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
  const scrollTo = useCallback((el: React.RefObject<HTMLElement | null>) => {
    el.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const vis = heroReady ? "is-visible" : "";

  return (
    <div className="landing-page">
      {/* ── LOADER ── */}
      <div className={`lp-loader ${loaded ? "loaded" : ""}`}>
        <span className="loader-logo">
          boss<span style={{ color: "#525252" }}>.ai</span>
        </span>
      </div>

      {/* ── NAVIGATION ── */}
      <nav
        className={`lp-nav fixed top-0 w-full z-50 border-b border-transparent ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight leading-none no-underline text-white"
          >
            boss<span className="text-neutral-600">.ai</span>
          </Link>
          <div className="flex items-center gap-8">
            <button onClick={() => scrollTo(workflowEl)} className="nav-link text-[13px] bg-transparent border-none cursor-pointer">
              仕組み
            </button>
            <button onClick={() => scrollTo(problemEl)} className="nav-link text-[13px] bg-transparent border-none cursor-pointer">
              課題
            </button>
            <button onClick={() => scrollTo(conceptEl)} className="nav-link text-[13px] bg-transparent border-none cursor-pointer">
              思想
            </button>
            <Link to="/login" className="nav-link text-[13px]">
              編集者登録
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden bg-dots">
        {/* Ambient orbs */}
        <div className="orb orb--emerald" aria-hidden="true" />
        <div className="orb orb--blue" aria-hidden="true" />
        <div className="orb orb--violet" aria-hidden="true" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="reveal-line mb-10">
            <div className={`reveal-text reveal-d1 inline-block ${vis}`}>
              <span className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-400 border border-white/[0.07] rounded-full px-5 py-2 bg-white/[0.02]">
                <span className="status-dot relative w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                動画制作の構造を変える
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-8">
            <span className="reveal-line">
              <span className={`reveal-text reveal-d2 hero-headline-gradient text-[clamp(2.8rem,8vw,6rem)] font-black leading-[1.05] tracking-tight ${vis}`}>
                AIが雇い、
              </span>
            </span>
            <span className="reveal-line">
              <span className={`reveal-text reveal-d3 text-[clamp(2.8rem,8vw,6rem)] font-black leading-[1.05] tracking-tight text-white ${vis}`}>
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
            <p className={`reveal-text reveal-d4 text-base sm:text-lg md:text-xl text-neutral-400 leading-[1.85] max-w-2xl mx-auto ${vis}`}>
              依頼主はAIと要件を固め、AIがクリエイターに発注し一次評価。
              <br className="hidden sm:block" />
              依頼主が最終確認するだけで、動画が届く。
            </p>
          </div>

          {/* English tagline */}
          <div className="reveal-line mb-12">
            <p className={`reveal-text reveal-d5 text-sm text-neutral-700 font-mono tracking-wide ${vis}`}>
              AI directs. Humans craft. You approve.
            </p>
          </div>

          {/* CTAs */}
          <div className="reveal-line">
            <div className={`reveal-text reveal-d6 flex flex-col sm:flex-row items-center justify-center gap-4 ${vis}`}>
              <Link to="/brief/new" className="cta">
                <span className="relative z-10">ブリーフを作成する</span>
                <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/login" className="cta-ghost">
                編集者として登録する
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <button onClick={() => scrollTo(workflowEl)} className="cta-ghost">
                仕組みを見る
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="scroll-indicator" />
        </div>
      </section>

      <div className="lp-divider max-w-6xl mx-auto" />

      {/* ── WORKFLOW ── */}
      <section ref={workflowEl} className="py-28 sm:py-40 px-6 relative">
        <div ref={workflow.ref} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-20 sr ${workflow.visible ? "is-visible" : ""}`}>
            <p className="mono-label text-emerald-500/60 mb-5">Workflow</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              4ステップで、<span className="text-neutral-400">自律的に回る。</span>
            </h2>
            <p className="text-neutral-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              発注から納品まで。AIがプロジェクトを統括し、人間が品質を仕上げる。
            </p>
          </div>

          {/* Flow: 4 steps + 3 connectors */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_48px_1fr_48px_1fr_48px_1fr] gap-3 md:gap-0 max-w-5xl mx-auto items-stretch sr-stagger">
            {/* Step 1: AI — 企画 */}
            <div className={`sr ${workflow.visible ? "is-visible" : ""}`}>
              <div className="glass glass--ai rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <span className="step-num step-num--ai">01</span>
                  <span className="step-label text-emerald-500/50">AI Director</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2">企画・分解</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75]">
                  依頼を分析し、構成・シーン・テロップを自動設計。タスクを生成し最適なクリエイターを選定。
                </p>
              </div>
            </div>

            {/* Connector 1→2 */}
            <div className={`flow-connector sr ${workflow.visible ? "is-visible" : ""}`} />

            {/* Step 2: Human — 編集 */}
            <div className={`sr ${workflow.visible ? "is-visible" : ""}`}>
              <div className="glass glass--human rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <span className="step-num step-num--human">02</span>
                  <span className="step-label text-blue-500/50">Human Editor</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2">編集・調整</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75]">
                  人間のクリエイターがカット編集、色補正、音声調整など品質に関わる領域を磨き上げる。
                </p>
              </div>
            </div>

            {/* Connector 2→3 */}
            <div className={`flow-connector sr ${workflow.visible ? "is-visible" : ""}`} />

            {/* Step 3: AI — 検品 */}
            <div className={`sr ${workflow.visible ? "is-visible" : ""}`}>
              <div className="glass glass--ai rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <span className="step-num step-num--ai">03</span>
                  <span className="step-label text-emerald-500/50">AI Review</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2">検品・一次評価</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75]">
                  完成物をAIが品質チェック。ガイドラインとの整合性を検証し、修正点を自動フィードバック。
                </p>
              </div>
            </div>

            {/* Connector 3→4 */}
            <div className={`flow-connector sr ${workflow.visible ? "is-visible" : ""}`} />

            {/* Step 4: Client — 納品 */}
            <div className={`sr ${workflow.visible ? "is-visible" : ""}`}>
              <div className="glass glass--client rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <span className="step-num step-num--client">04</span>
                  <span className="step-label text-amber-500/50">Client</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2">最終確認・納品</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75]">
                  依頼主が最終確認し承認。修正があればAIが即座にタスクを再分解し、サイクルを回す。
                </p>
              </div>
            </div>
          </div>

          {/* Flow summary */}
          <div
            className={`mt-16 text-center sr ${workflow.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".35s" }}
          >
            <div className="flow-pill text-sm">
              <span className="font-semibold text-emerald-400">AI</span>
              <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="font-semibold text-blue-400">人間</span>
              <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="font-semibold text-emerald-400">AI</span>
              <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="font-semibold text-amber-400">依頼主</span>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-6xl mx-auto" />

      {/* ── PROBLEM → SOLUTION ── */}
      <section ref={problemEl} className="py-28 sm:py-40 px-6">
        <div ref={problem.ref} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-20 sr ${problem.visible ? "is-visible" : ""}`}>
            <p className="mono-label text-red-400/50 mb-5">Problem &amp; Solution</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              構造で、<span className="text-neutral-400">課題を解く。</span>
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto sr-stagger">
            {/* Card 1 */}
            <div className={`sr ${problem.visible ? "is-visible" : ""}`}>
              <div className="glass rounded-2xl p-7 h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="ps-icon ps-icon--problem">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </span>
                  <span className="mono-label text-red-400/50" style={{ fontSize: 10 }}>Problem</span>
                </div>
                <h3 className="text-[15px] font-semibold mb-2 text-red-300/80">ディレクションに時間が消える</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75] mb-6">
                  クリエイター選定、指示書作成、進捗管理。動画の中身より「管理業務」にリソースが取られる。
                </p>
                <div className="ps-divider mb-6" />
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="ps-icon ps-icon--solve">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="mono-label text-emerald-500/50" style={{ fontSize: 10 }}>Solution</span>
                </div>
                <p className="text-[13px] text-neutral-300 leading-[1.75]">
                  AIが要件定義からタスク分解、人材アサインまでを自動化。依頼主は「確認するだけ」に。
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className={`sr ${problem.visible ? "is-visible" : ""}`}>
              <div className="glass rounded-2xl p-7 h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="ps-icon ps-icon--problem">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </span>
                  <span className="mono-label text-red-400/50" style={{ fontSize: 10 }}>Problem</span>
                </div>
                <h3 className="text-[15px] font-semibold mb-2 text-red-300/80">品質がばらつく</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75] mb-6">
                  担当者の力量次第でアウトプットが変わる。AI単体では「最後の1%」が仕上がらない。
                </p>
                <div className="ps-divider mb-6" />
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="ps-icon ps-icon--solve">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="mono-label text-emerald-500/50" style={{ fontSize: 10 }}>Solution</span>
                </div>
                <p className="text-[13px] text-neutral-300 leading-[1.75]">
                  AIが一次品質を担保し、人間の職人が仕上げる二重構造。属人性を排除しつつ、クオリティを維持。
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className={`sr ${problem.visible ? "is-visible" : ""}`}>
              <div className="glass rounded-2xl p-7 h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="ps-icon ps-icon--problem">
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </span>
                  <span className="mono-label text-red-400/50" style={{ fontSize: 10 }}>Problem</span>
                </div>
                <h3 className="text-[15px] font-semibold mb-2 text-red-300/80">本数が増えるとスケールしない</h3>
                <p className="text-[13px] text-neutral-500 leading-[1.75] mb-6">
                  人に依存する制作フローは、本数に比例してコストが線形に膨らむ。
                </p>
                <div className="ps-divider mb-6" />
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="ps-icon ps-icon--solve">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="mono-label text-emerald-500/50" style={{ fontSize: 10 }}>Solution</span>
                </div>
                <p className="text-[13px] text-neutral-300 leading-[1.75]">
                  AIが並列でプロジェクトを統括。10本でも100本でも、管理コストはほぼ一定。仕組みで解く。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-6xl mx-auto" />

      {/* ── CONCEPT ── */}
      <section ref={conceptEl} className="py-28 sm:py-40 px-6 relative overflow-hidden">
        <div className="concept-glow" aria-hidden="true" />

        <div ref={concept.ref} className="relative z-10 max-w-4xl mx-auto text-center">
          <div className={`sr ${concept.visible ? "is-visible" : ""}`}>
            <p className="mono-label text-purple-400/50 mb-14">Concept</p>
            <blockquote className="concept-quote mb-10">
              <span className="text-white">AIが、ボスになる。</span>
              <br />
              <span className="text-neutral-400">人間は、職人になる。</span>
            </blockquote>
          </div>

          <div
            className={`sr ${concept.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".12s" }}
          >
            <p className="text-neutral-400 text-base sm:text-lg leading-[1.9] max-w-2xl mx-auto mb-16">
              プロジェクト管理、タスク分解、品質管理はAIが担う。
              <br />
              人間は、クリエイティブという
              <span className="text-neutral-200 font-medium">「最も人間的な仕事」</span>
              に集中する。
            </p>
          </div>

          <div
            className={`sr ${concept.visible ? "is-visible" : ""}`}
            style={{ transitionDelay: ".24s" }}
          >
            <div className="definition-box px-8 sm:px-12 py-7 max-w-lg mx-auto">
              <p className="mono-label text-neutral-600 mb-3" style={{ fontSize: 10 }}>
                Definition
              </p>
              <p className="text-[15px] sm:text-base text-neutral-300 leading-[1.75] font-medium">
                <span className="text-white font-bold">boss.ai</span>
                <span className="text-neutral-600 mx-1">=</span>
                AIがディレクションし、人間がクラフトする動画制作プラットフォーム
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider max-w-6xl mx-auto" />

      {/* ── FOOTER ── */}
      <footer className="py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-extrabold tracking-tight">
            boss<span className="text-neutral-700">.ai</span>
          </span>
          <span className="text-xs text-neutral-800">
            &copy; 2025 boss.ai &mdash; All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
