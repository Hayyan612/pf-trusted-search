import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth, pool } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { BriefSchema } from "@/lib/brief";

async function userId() {
  await ensureDb();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Sign in to sync your brief" }, { status: 401 });
  const { rows } = await pool.query("SELECT brief, updated_at_ms FROM brief WHERE user_id = $1", [uid]);
  return NextResponse.json(rows[0] ? { brief: rows[0].brief, updatedAt: Number(rows[0].updated_at_ms) } : { brief: null, updatedAt: 0 });
}

export async function PUT(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Sign in to sync your brief" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = BriefSchema.safeParse(body?.brief);
  const updatedAt = Number(body?.updatedAt) || Date.now();
  if (!parsed.success) return NextResponse.json({ error: "Invalid brief" }, { status: 400 });
  await pool.query(
    `INSERT INTO brief (user_id, brief, updated_at_ms) VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET brief = EXCLUDED.brief, updated_at_ms = EXCLUDED.updated_at_ms`,
    [uid, JSON.stringify(parsed.data), updatedAt],
  );
  return NextResponse.json({ ok: true });
}
