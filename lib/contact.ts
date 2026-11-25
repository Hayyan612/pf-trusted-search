"use client";

import { useSyncExternalStore } from "react";

/** How agents can reach the person. Kept in this browser; shared only with the agents they choose, when they send. */
export interface Contact {
  name: string;
  phone: string;
  email: string;
  channel: "whatsapp" | "email" | "app";
}

const KEY = "trueunit-contact-v1";
const listeners = new Set<() => void>();
const EMPTY: Contact = { name: "", phone: "", email: "", channel: "whatsapp" };
let cache: Contact | undefined;

function read(): Contact {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) || "null") ?? {}) };
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

export function saveContact(c: Contact) {
  cache = c;
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l());
}

export function useContact(): Contact {
  return useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), read, () => EMPTY);
}

export function contactProblem(c: Contact): string | null {
  if (!c.name.trim()) return "Add your name so agents know who is asking.";
  if (c.channel === "whatsapp" && !/^\+?[\d\s-]{8,16}$/.test(c.phone.trim())) return "Add a WhatsApp number, e.g. +971 50 123 4567.";
  if (c.channel === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email.trim())) return "Add a valid email.";
  return null;
}

export const CHANNEL_LABEL = { whatsapp: "WhatsApp", email: "Email", app: "Property Finder app only" } as const;
