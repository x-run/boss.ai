import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type {
  Brief,
  Message,
  AiOptionsMessage,
  BriefStore,
  StepDef,
  Tone,
} from "../types/brief";
import { EMPTY_BRIEF, uid } from "../types/brief";
import { load, save, remove } from "../storage/kv";
import ChatThread from "../components/brief/ChatThread";
import BriefPanel from "../components/brief/BriefPanel";
import AssetModal from "../components/brief/AssetModal";
import type { AssetForm } from "../components/brief/AssetModal";

/* ================================================================
   STEP DEFINITIONS
   ================================================================ */

const STEPS: StepDef[] = [
  {
    key: "purpose",
    text: "まず、動画の用途を教えてください。\nプラットフォームに合わせた構成を提案します。",
    options: [
      { label: "TikTok", value: "TikTok" },
      { label: "Reels", value: "Reels" },
      { label: "YouTube", value: "YouTube" },
      { label: "広告", value: "広告" },
    ],
  },
  {
    key: "duration",
    customInput: "duration",
    text: "動画の尺はどれくらいを想定していますか？",
    options: [
      { label: "30秒", value: "30秒" },
      { label: "45秒", value: "45秒" },
      { label: "60秒", value: "60秒" },
    ],
  },
  {
    key: "target",
    customInput: "target",
    text: "ターゲットとなる視聴者を教えてください。\nコンテンツの方向性を決める大事な要素です。",
    options: [
      { label: "初心者", value: "初心者" },
      { label: "ビジネス層", value: "ビジネス層" },
      { label: "学生", value: "学生" },
      { label: "主婦", value: "主婦" },
      { label: "クリエイター", value: "クリエイター" },
      { label: "エンジニア", value: "エンジニア" },
      { label: "起業家", value: "起業家" },
    ],
  },
  {
    key: "tones",
    multi: true,
    text: "動画のトーン（雰囲気）を選んでください。\n複数選択できます。選んだら「確定する」を押してください。",
    options: [
      { label: "Energetic", value: "Energetic" },
      { label: "Calm", value: "Calm" },
      { label: "Luxury", value: "Luxury" },
      { label: "Casual", value: "Casual" },
    ],
  },
  {
    key: "concept",
    input: true,
    text: '動画のコンセプトやテーマを一言で教えてください。\n例：「忙しい人でも3分でわかるAI入門」',
  },
  {
    key: "details",
    input: true,
    text: "最後に、参考URL・要望・注意点など伝えておきたいことがあれば教えてください。\n特になければ「なし」で大丈夫です。",
  },
];

const STORAGE_KEY = "boss-brief";

/* ================================================================
   HELPERS
   ================================================================ */

function mkAiText(text: string): Message {
  return { id: uid(), role: "ai", type: "text", text };
}

function mkAiOptions(step: StepDef, stepIdx: number): AiOptionsMessage {
  return {
    id: uid(),
    role: "ai",
    type: "options",
    text: step.text,
    key: step.key,
    multi: !!step.multi,
    answered: false,
    options: step.options,
    customInput: step.customInput ?? null,
    // store stepIdx so we can recover on reload
    ...(({ _stepIdx: stepIdx } as unknown) as Record<string, unknown>),
  } as AiOptionsMessage;
}

function mkUser(text: string): Message {
  return { id: uid(), role: "user", text };
}

function buildStepMessage(stepIdx: number): Message {
  const s = STEPS[stepIdx];
  if (s.options) return mkAiOptions(s, stepIdx);
  return mkAiText(s.text);
}

function computeCompleteness(b: Brief): number {
  let n = 0;
  if (b.purpose) n++;
  if (b.duration) n++;
  if (b.target) n++;
  if (b.tones.length) n++;
  if (b.concept) n++;
  if (b.details) n++;
  return Math.round((n / 6) * 100);
}

/* ================================================================
   COMPONENT
   ================================================================ */

export default function BriefNew() {
  /* ── core state ── */
  const [brief, setBrief] = useState<Brief>({ ...EMPTY_BRIEF });
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [typing, setTyping] = useState(false);

  /* ── ephemeral UI state ── */
  const [pendingTones, setPendingTones] = useState<Tone[]>([]);
  const [inputText, setInputText] = useState("");

  /* ── asset modal ── */
  const [showAssetModal, setShowAssetModal] = useState(false);

  /* ── refs ── */
  const textRef = useRef<HTMLInputElement>(null);
  const bootedRef = useRef(false);

  /* ── derived ── */
  const completeness = useMemo(() => computeCompleteness(brief), [brief]);

  const showTextInput = useMemo(() => {
    if (step < 0 || step >= STEPS.length) return false;
    return !!STEPS[step].input;
  }, [step]);

  const textPlaceholder = useMemo(() => {
    if (step < 0 || step >= STEPS.length) return "";
    return STEPS[step].key === "concept"
      ? "コンセプトを入力..."
      : "参考URL・要望など...";
  }, [step]);

  /* ── persistence ── */
  const persist = useCallback(
    (b: Brief, msgs: Message[], s: number, d: boolean) => {
      save<BriefStore>(STORAGE_KEY, { brief: b, messages: msgs, step: s, done: d });
    },
    [],
  );

  /* ── advance to next step ── */
  const advance = useCallback(
    async (
      currentBrief: Brief,
      currentMsgs: Message[],
      currentStep: number,
    ) => {
      const nextStep = currentStep + 1;

      if (nextStep >= STEPS.length) {
        // done
        setTyping(true);
        setStep(nextStep);
        persist(currentBrief, currentMsgs, nextStep, false);
        await new Promise((r) => setTimeout(r, 700));
        setTyping(false);

        const doneMsg = mkAiText(
          "ブリーフが完成しました！\nこの内容をもとに、AIが最適な制作プランを設計します。",
        );
        const finalMsgs = [...currentMsgs, doneMsg];
        setMessages(finalMsgs);
        setDone(true);
        setStep(nextStep);
        persist(currentBrief, finalMsgs, nextStep, true);
        return;
      }

      // typing indicator
      setTyping(true);
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
      setTyping(false);

      const stepMsg = buildStepMessage(nextStep);
      const newMsgs = [...currentMsgs, stepMsg];
      setMessages(newMsgs);
      setStep(nextStep);
      persist(currentBrief, newMsgs, nextStep, false);

      // focus text input for input steps
      if (STEPS[nextStep].input) {
        setTimeout(() => textRef.current?.focus(), 100);
      }
    },
    [persist],
  );

  /* ── boot (runs once) ── */
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const stored = load<BriefStore>(STORAGE_KEY);
    if (stored && stored.brief) {
      const b: Brief = { ...EMPTY_BRIEF, ...stored.brief };
      if (!Array.isArray(b.tones)) b.tones = [];
      const msgs: Message[] = stored.messages ?? [];
      const s = stored.step ?? -1;
      const d = stored.done ?? false;

      setBrief(b);
      setMessages(msgs);
      setStep(s);
      setDone(d);

      // recover missing AI message for current step
      if (
        !d &&
        s >= 0 &&
        s < STEPS.length &&
        !msgs.some(
          (m) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (m as any)._stepIdx === s,
        )
      ) {
        const recovered = buildStepMessage(s);
        const newMsgs = [...msgs, recovered];
        setMessages(newMsgs);
        persist(b, newMsgs, s, d);
      }

      return;
    }

    // fresh start
    const greeting = mkAiText(
      "こんにちは！boss.ai のブリーフ作成アシスタントです。\nいくつかの質問に答えるだけで、動画の制作ブリーフが完成します。",
    );
    const initMsgs = [greeting];
    setMessages(initMsgs);
    advance({ ...EMPTY_BRIEF }, initMsgs, -1);
  }, [advance, persist]);

  /* ── actions ── */

  const pickSingle = useCallback(
    (msgId: string, optValue: string, optLabel: string) => {
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === msgId && m.role === "ai" && m.type === "options"
            ? { ...m, answered: true }
            : m,
        );
        const withUser = [...next, mkUser(optLabel)];
        const stepDef = STEPS[step];
        const newBrief = { ...brief, [stepDef.key]: optValue };
        setBrief(newBrief);
        persist(newBrief, withUser, step, false);
        advance(newBrief, withUser, step);
        return withUser;
      });
    },
    [step, brief, persist, advance],
  );

  const toggleTone = useCallback(
    (val: Tone) => {
      setPendingTones((prev) =>
        prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val],
      );
    },
    [],
  );

  const confirmTones = useCallback(
    (msgId: string) => {
      if (!pendingTones.length) return;
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === msgId && m.role === "ai" && m.type === "options"
            ? { ...m, answered: true }
            : m,
        );
        const withUser = [...next, mkUser(pendingTones.join(" / "))];
        const newBrief = { ...brief, tones: [...pendingTones] };
        setBrief(newBrief);
        setPendingTones([]);
        persist(newBrief, withUser, step, false);
        advance(newBrief, withUser, step);
        return withUser;
      });
    },
    [pendingTones, step, brief, persist, advance],
  );

  const submitCustomDuration = useCallback(
    (msgId: string, seconds: number) => {
      const label = seconds + "秒";
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === msgId && m.role === "ai" && m.type === "options"
            ? { ...m, answered: true }
            : m,
        );
        const withUser = [...next, mkUser(label)];
        const newBrief = { ...brief, duration: label };
        setBrief(newBrief);
        persist(newBrief, withUser, step, false);
        advance(newBrief, withUser, step);
        return withUser;
      });
    },
    [step, brief, persist, advance],
  );

  const submitOtherTarget = useCallback(
    (msgId: string, text: string) => {
      const v = text.trim();
      if (!v) return;
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === msgId && m.role === "ai" && m.type === "options"
            ? { ...m, answered: true }
            : m,
        );
        const withUser = [...next, mkUser(v)];
        const newBrief = { ...brief, target: v };
        setBrief(newBrief);
        persist(newBrief, withUser, step, false);
        advance(newBrief, withUser, step);
        return withUser;
      });
    },
    [step, brief, persist, advance],
  );

  const submitText = useCallback(() => {
    const v = inputText.trim();
    if (!v) return;
    setMessages((prev) => {
      const withUser = [...prev, mkUser(v)];
      const stepDef = STEPS[step];
      const newBrief = { ...brief, [stepDef.key]: v };
      setBrief(newBrief);
      setInputText("");
      persist(newBrief, withUser, step, false);
      advance(newBrief, withUser, step);
      return withUser;
    });
  }, [inputText, step, brief, persist, advance]);

  const reset = useCallback(() => {
    if (!confirm("ブリーフをリセットしますか？")) return;
    remove(STORAGE_KEY);
    const freshBrief = { ...EMPTY_BRIEF };
    setBrief(freshBrief);
    setDone(false);
    setPendingTones([]);
    setInputText("");
    setShowAssetModal(false);

    const resetMsg = mkAiText("リセットしました。もう一度はじめましょう！");
    const initMsgs = [resetMsg];
    setMessages(initMsgs);
    setStep(-1);
    advance(freshBrief, initMsgs, -1);
  }, [advance]);

  /* ── asset modal actions ── */

  const openAssetModal = useCallback(() => {
    setShowAssetModal(true);
  }, []);

  const saveAssets = useCallback(
    (form: AssetForm) => {
      const newBrief: Brief = { ...brief, ...form };
      setBrief(newBrief);
      persist(newBrief, messages, step, done);
    },
    [brief, messages, step, done, persist],
  );

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* ── CHAT COLUMN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* nav bar area */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-10 border-b border-white/[0.06]">
          <span className="text-[11px] text-neutral-500">ブリーフ作成</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-600">
              {completeness}%
            </span>
            <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <button
              onClick={reset}
              className="text-[11px] text-neutral-700 hover:text-red-400 transition-colors"
            >
              リセット
            </button>
          </div>
        </div>

        {/* messages + typing + auto-scroll */}
        <ChatThread
          messages={messages}
          typing={typing}
          pendingTones={pendingTones as string[]}
          onPickSingle={(msgId, v, l) => pickSingle(msgId, v, l)}
          onToggleTone={(v) => toggleTone(v as Tone)}
          onConfirmTones={(msgId) => confirmTones(msgId)}
          onSubmitCustomDuration={(msgId, s) => submitCustomDuration(msgId, s)}
          onSubmitOtherTarget={(msgId, t) => submitOtherTarget(msgId, t)}
        />

        {/* text input */}
        {showTextInput && !done && (
          <div className="shrink-0 border-t border-white/[0.06] px-4 sm:px-6 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitText();
              }}
              className="max-w-2xl mx-auto flex gap-3"
            >
              <input
                ref={textRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={textPlaceholder}
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/[0.035] border border-white/[0.07]
                           text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/40 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-xl text-[13px] font-semibold transition-all
                           disabled:bg-white/[0.04] disabled:text-neutral-700 disabled:cursor-not-allowed
                           bg-white text-black hover:shadow-lg"
              >
                送信
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── BRIEF PANEL (right + mobile slide-in) ── */}
      <BriefPanel
        brief={brief}
        completeness={completeness}
        done={done}
        onOpenAssets={openAssetModal}
      />

      {/* ── ASSET MODAL ── */}
      <AssetModal
        isOpen={showAssetModal}
        initialValue={{
          assets_url: brief.assets_url,
          bgm_url: brief.bgm_url,
          logo_url: brief.logo_url,
          thumb_url: brief.thumb_url,
          font_note: brief.font_note,
        }}
        onClose={() => setShowAssetModal(false)}
        onSave={saveAssets}
      />
    </div>
  );
}

