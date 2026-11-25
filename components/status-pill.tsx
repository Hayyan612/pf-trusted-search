import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COPY, type Severity } from "@/lib/data";

const ICON = { ok: ShieldCheck, ask: ShieldAlert, hide: ShieldX };

export function StatusPill({ status, className }: { status: Severity; className?: string }) {
  const Icon = ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium",
        STATUS_COPY[status].tone,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {STATUS_COPY[status].label}
    </span>
  );
}
