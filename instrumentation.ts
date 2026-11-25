// Try to create tables at startup; if the database is not up yet, the first request retries (lib/db.ts).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  const { ensureDb } = await import("@/lib/db");
  await ensureDb().then(() => console.log("[db] ready")).catch((err) => console.error("[db] not ready at startup", err?.code ?? err));
}
