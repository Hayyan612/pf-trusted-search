// Try to create tables at startup; if the database is not up yet, the first request retries (lib/db.ts).
if (process.env.DATABASE_URL) {
  import("@/lib/db")
    .then(({ ensureDb }) => ensureDb())
    .then(() => console.log("[db] ready"))
    .catch((err) => console.error("[db] not ready at startup", err?.code ?? err));
}
export {};
