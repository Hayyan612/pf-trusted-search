// Next.js startup hook. The Node-only part lives in instrumentation-node.ts so the edge build never bundles pg.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
