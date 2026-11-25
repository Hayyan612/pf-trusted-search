import { getMigrations } from "better-auth/db";
import { auth, pool } from "@/lib/auth";

let ready: Promise<void> | null = null;

/** Creates the auth and shortlist tables once per server process; retried on the next call if it fails. */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const { runMigrations } = await getMigrations(auth.options);
      await runMigrations();
      await pool.query(`CREATE TABLE IF NOT EXISTS shortlist (
        user_id TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        item JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, listing_id)
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS brief (
        user_id TEXT PRIMARY KEY,
        brief JSONB NOT NULL,
        updated_at_ms BIGINT NOT NULL
      )`);
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
