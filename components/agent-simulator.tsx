"use client";

import { useEffect } from "react";
import { currentShortlist, replaceShortlist, type ShortlistItem } from "@/lib/shortlist";
import { simulateReply } from "@/lib/questions";
import { getListing } from "@/lib/data";

/**
 * Prototype only: plays the agents' side so the whole loop can be clicked through.
 * Replies arrive one by one; one agent is slow until nudged; viewings and offers get answered after a few seconds.
 */
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
/** The 4th agent asked is the slow one, so the nudge follow-up always shows in a demo. */
const replyDelay = (it: ShortlistItem, order: number) => (order === 3 ? 10 * 60_000 : 5_000 + (hash(it.id) % 4) * 4_000);

export function AgentSimulator() {
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const list = currentShortlist();
      const order = new Map([...list].sort((a, b) => a.requestedAt - b.requestedAt).map((x, i) => [x.id, i]));
      const next = list.map((it) => {
        const l = getListing(it.id);
        if (!l) return it;
        let x = it;
        const due = it.nudgedAt ? it.nudgedAt + 4_000 : it.requestedAt + replyDelay(it, order.get(it.id) ?? 0);
        if (!x.reply && now > due) x = { ...x, reply: simulateReply(l) };
        if (x.viewing?.status === "requested" && now - x.viewing.at > 4_000) x = { ...x, viewing: { ...x.viewing, status: "confirmed" } };
        if (x.offer?.status === "sent" && now - x.offer.at > 5_000) {
          const fair = x.offer.amount >= l.price * 0.95;
          x = { ...x, offer: fair ? { ...x.offer, status: "accepted", answeredAt: now } : { ...x.offer, status: "countered", counter: Math.round((x.offer.amount + l.price) / 2 / 1000) * 1000, answeredAt: now } };
        }
        if (x !== it) changed = true;
        return x;
      });
      if (changed) replaceShortlist(next);
    }, 1_000);
    return () => clearInterval(t);
  }, []);
  return null;
}
