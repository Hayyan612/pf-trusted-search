"use client";

import { useSyncExternalStore } from "react";
import type { Brief } from "@/lib/brief";

/** The person's brief. Guests: this browser. Signed in: synced to the account (components/brief-sync.tsx). */
const KEY = "trueunit-brief-v1";
const listeners = new Set<() => void>();
let cache: { brief: Brief | null; updatedAt: number } | undefined;

function read() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "null") ?? { brief: null, updatedAt: 0 };
  } catch {
    cache = { brief: null, updatedAt: 0 };
  }
  return cache!;
}

export function saveBrief(brief: Brief | null, updatedAt = Date.now()) {
  cache = { brief, updatedAt };
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
