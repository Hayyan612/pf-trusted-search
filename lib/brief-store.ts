"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_BRIEF, type Brief } from "@/lib/brief";

/** Briefs saved by older versions miss newer fields; fill them so the page never reads undefined. */
export function normalizeBrief(b: unknown): Brief | null {
  if (!b || typeof b !== "object") return null;
  const x = { ...EMPTY_BRIEF, ...(b as Partial<Brief>) };
  return {
    ...x,
    beds: Array.isArray(x.beds) ? x.beds : [],
    mustHaves: Array.isArray(x.mustHaves) ? x.mustHaves : [],
    nearby: Array.isArray(x.nearby) ? x.nearby : [],
  };
}

/** The person's brief. Guests: this browser. Signed in: synced to the account (components/brief-sync.tsx). */
const KEY = "trueunit-brief-v1";
const listeners = new Set<() => void>();
let cache: { brief: Brief | null; updatedAt: number } | undefined;

function read() {
  if (cache) return cache;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    cache = { brief: normalizeBrief(saved?.brief), updatedAt: Number(saved?.updatedAt) || 0 };
  } catch {
    cache = { brief: null, updatedAt: 0 };
  }
  return cache!;
}

export function saveBrief(brief: Brief | null, updatedAt = Date.now()) {
  cache = { brief: normalizeBrief(brief), updatedAt };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function currentBrief() {
  return read();
}

export function onBriefChange(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const SERVER = { brief: null, updatedAt: 0 };

export function useBrief(): Brief | null {
  return useSyncExternalStore(onBriefChange, read, () => SERVER).brief;
}
