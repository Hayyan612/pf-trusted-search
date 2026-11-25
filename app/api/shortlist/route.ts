import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth, pool } from "@/lib/auth";

const MAX_ITEMS = 100;

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Sign in to sync your shortlist" }, { status: 401 });
  const { rows } = await pool.query("SELECT item FROM shortlist WHERE user_id = $1 ORDER BY updated_at DESC", [uid]);
  return NextResponse.json({ items: rows.map((r) => r.item) });
}

/** Replaces the user's shortlist with the posted list. */
export async function PUT(req: Request) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Sign in to sync your shortlist" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items || items.length > MAX_ITEMS || !items.every((i: { id?: unknown }) => typeof i?.id === "string" && /^\d{1,12}$/.test(i.id))) {
    return NextResponse.json({ error: "Invalid shortlist" }, { status: 400 });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM shortlist WHERE user_id = $1", [uid]);
    for (const it of items) {
      await client.query("INSERT INTO shortlist (user_id, listing_id, item) VALUES ($1, $2, $3)", [uid, it.id, JSON.stringify(it)]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[shortlist] save failed", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  } finally {
    client.release();
  }
  return NextResponse.json({ ok: true });
}
