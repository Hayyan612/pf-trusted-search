import Script from "next/script";

/** Umami (self-hosted, cookieless). The website ID is public by design; set it to turn tracking on. */
const UMAMI_SRC = "https://stats.hayyan.space/script.js";
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? "474c2ea9-d04e-4bba-b880-7b528b535987";

export function Analytics() {
  if (!UMAMI_WEBSITE_ID) return null;
  return <Script src={UMAMI_SRC} data-website-id={UMAMI_WEBSITE_ID} data-domains="trueunit.hayyan.space" strategy="afterInteractive" />;
}
