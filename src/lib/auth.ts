import { load, save, remove } from "../storage/kv";

/* ── Types ── */

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface Session {
  provider: "google";
  idToken: string;
  user: GoogleUser;
  createdAt: number;
}

/* ── Constants ── */

const SESSION_KEY = "boss-session";

/* ── Session CRUD ── */

export function loadSession(): Session | null {
  return load<Session>(SESSION_KEY);
}

export function saveSession(session: Session): void {
  save(SESSION_KEY, session);
}

export function clearSession(): void {
  remove(SESSION_KEY);
}

/* ── JWT Decode ── */

/**
 * Decode the payload portion of a JWT (second segment).
 * No signature verification — acceptable because there is no backend.
 */
export function decodeJwtPayload(token: string): GoogleUser {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  const payload: Record<string, unknown> = JSON.parse(json);
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string,
  };
}
