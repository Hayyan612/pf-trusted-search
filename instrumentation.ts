// Runs once when the server starts: creates the auth tables and the shortlist table if missing.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  try {
    const { getMigrations } = await import("better-auth/db");
    const { auth, pool } = await import("@/lib/auth");
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
    await pool.query(`CREATE TABLE IF NOT EXISTS shortlist (
      user_id TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      item JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, listing_id)
    )`);
    console.log("[db] migrations done");
  } catch (err) {
    console.error("[db] migration failed", err);
  }
}
