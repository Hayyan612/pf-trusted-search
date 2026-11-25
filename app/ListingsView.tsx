import Link from "next/link";
import type { Listing } from "@/lib/listings";

function formatPrice(listing: Listing): string {
  if (typeof listing.price !== "number") return "Price on request";
  return `${listing.currency ?? "AED"} ${listing.price.toLocaleString("en-US")}`;
}

export default function ListingsView({ title, listings }: { title: string; listings: Listing[] }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="text-sm text-zinc-500">
        &larr; Back
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      {listings.length === 0 ? (
        <p className="text-zinc-500">No listings yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((l) => (
            <li key={l.id} className="rounded-xl border border-zinc-200 p-4">
              <div className="text-lg font-semibold">{formatPrice(l)}</div>
              <div className="text-sm text-zinc-600">
                {l.beds ?? "?"} beds · {l.sizeSqft ? `${l.sizeSqft.toLocaleString("en-US")} sqft` : "size n/a"}
              </div>
              <div className="text-sm text-zinc-500">Agent: {l.agent ?? "Unknown"}</div>
              {l.placeholder && <div className="mt-1 text-xs text-amber-600">Placeholder data</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
