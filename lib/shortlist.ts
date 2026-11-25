"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A request TrueUnit sends to the listing agent on the searcher's behalf. Replies are simulated in this prototype. */
export interface ShortlistItem {
  id: string; // listing id
  requestedAt: number;
  questions: string[];
  note?: string;
  reply?: AgentReply;
}

export interface AgentReply {
  outcome: "confirmed" | "changed" | "unavailable";
  at: number;
  minutes: number;
  lines: string[];
}

const KEY = "trueunit-shortlist-v1";
const listeners = new Set<() => void>();
let cache: ShortlistItem[] | null = null;

function read(): ShortlistItem[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: ShortlistItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

const EMPTY: ShortlistItem[] = [];

export function useShortlist() {
  const items = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
  const add = useCallback((item: ShortlistItem) => {
    write([item, ...read().filter((i) => i.id !== item.id)]);
  }, []);
  const update = useCallback((id: string, patch: Partial<ShortlistItem>) => {
    write(read().map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);
  const remove = useCallback((id: string) => write(read().filter((i) => i.id !== id)), []);
  const clear = useCallback(() => write([]), []);
  return { items, add, update, remove, clear };
}

/** Merge two shortlists by listing id; keep the newest request and any reply. */
export function mergeShortlists(a: ShortlistItem[], b: ShortlistItem[]): ShortlistItem[] {
  const map = new Map<string, ShortlistItem>();
  for (const it of [...a, ...b]) {
    const prev = map.get(it.id);
    if (!prev) map.set(it.id, it);
    else map.set(it.id, { ...(prev.requestedAt >= it.requestedAt ? prev : it), reply: prev.reply ?? it.reply });
  }
  return [...map.values()].sort((x, y) => y.requestedAt - x.requestedAt);
}

export function replaceShortlist(items: ShortlistItem[]) {
  write(items);
}

export function onShortlistChange(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function currentShortlist() {
  return read();
}
