/* ── Value types ── */

export type Platform = "TikTok" | "Reels" | "YouTube" | "広告";
export type Tone = "Energetic" | "Calm" | "Luxury" | "Casual";

export interface Brief {
  purpose: Platform | "";
  duration: string;
  target: string;
  tones: Tone[];
  concept: string;
  details: string;
  assets_url: string;
  bgm_url: string;
  logo_url: string;
  thumb_url: string;
  font_note: string;
}

/* ── Message types (discriminated union) ── */

export interface AiTextMessage {
  id: string;
  role: "ai";
  type: "text";
  text: string;
}

export interface AiOptionsMessage {
  id: string;
  role: "ai";
  type: "options";
  text: string;
  key: string;
  multi: boolean;
  answered: boolean;
  options?: { label: string; value: string }[];
  customInput?: "duration" | "target" | null;
}

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}

export type Message = AiTextMessage | AiOptionsMessage | UserMessage;

/* ── Persisted shape ── */

export interface BriefStore {
  brief: Brief;
  messages: Message[];
  step: number;
  done: boolean;
}

/* ── Step definition (static config) ── */

export interface StepDef {
  key: keyof Brief;
  multi?: boolean;
  input?: boolean;
  customInput?: "duration" | "target";
  text: string;
  options?: { label: string; value: string }[];
}

/* ── Helpers ── */

export const EMPTY_BRIEF: Brief = {
  purpose: "",
  duration: "",
  target: "",
  tones: [],
  concept: "",
  details: "",
  assets_url: "",
  bgm_url: "",
  logo_url: "",
  thumb_url: "",
  font_note: "",
};

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
