"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { currentBrief, onBriefChange, saveBrief } from "@/lib/brief-store";

/** Signed in: the newer of the device's brief and the account's brief wins, then changes are saved to the account. */
export function BriefSync() {
  const { data } = useSession();
  const uid = data?.user.id;
  const ready = useRef(false);

  useEffect(() => {
    if (!uid) return;
    ready.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const push = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { brief, updatedAt } = currentBrief();
        if (!brief) return;
        fetch("/api/brief", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief, updatedAt }) }).catch(() => {});
      }, 400);
    };
    fetch("/api/brief")
      .then((r) => (r.ok ? r.json() : null))
      .then((server) => {
        const local = currentBrief();
        if (server?.brief && server.updatedAt > local.updatedAt) saveBrief(server.brief, server.updatedAt);
        ready.current = true;
        if (local.brief && (!server?.brief || local.updatedAt >= server.updatedAt)) push();
      })
      .catch(() => (ready.current = true));
    const off = onBriefChange(() => ready.current && push());
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [uid]);

  return null;
}
