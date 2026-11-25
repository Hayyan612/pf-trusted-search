import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDb();
    return NextResponse.json({ ok: true, db: "ready" });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "unknown";
    console.error("[health] db not ready", err);
    return NextResponse.json({ ok: false, db: "error", code }, { status: 503 });
  }
}
