"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { currentShortlist, mergeShortlists, onShortlistChange, replaceShortlist } from "@/lib/shortlist";

/** When signed in, merges this device's shortlist with the account's and keeps them in sync. */
export function ShortlistSync() {
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
        fetch("/api/shortlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: currentShortlist() }),
        }).catch(() => toast.error("Could not sync your shortlist. It is still saved on this device."));
      }, 400);
    };
    fetch("/api/shortlist")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then(({ items }) => {
        replaceShortlist(mergeShortlists(currentShortlist(), items ?? []));
        ready.current = true;
        push();
      })
      .catch(() => (ready.current = true));
    const off = onShortlistChange(() => ready.current && push());
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [uid]);

  return null;
}
