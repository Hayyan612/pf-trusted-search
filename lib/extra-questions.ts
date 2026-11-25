"use client";

import { useSyncExternalStore } from "react";

/** Questions the person added for one listing from "Ask Scout"; merged into "Confirm before I call". */
const KEY = "trueunit-extra-questions-v1";
const listeners = new Set<() => void>();
let cache: Record<string, string[]> | null = null;
const read = () => {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { cache = {}; }
  return cache!;
};
const EMPTY: Record<string, string[]> = {};
export function addExtraQuestion(id: string, q: string) {
  const cur = read();
  if ((cur[id] ?? []).includes(q)) return;
  cache = { ...cur, [id]: [...(cur[id] ?? []), q] };
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* storage blocked */ }
  listeners.forEach((l) => l());
}
export function useExtraQuestions(id: string): string[] {
  const all = useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), read, () => EMPTY);
  return all[id] ?? [];
}
