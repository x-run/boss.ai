/** Typed localStorage get with JSON parse. Returns `null` on missing or corrupt data. */
export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Typed localStorage set with JSON.stringify. */
export function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Remove a key. */
export function remove(key: string): void {
  localStorage.removeItem(key);
}
