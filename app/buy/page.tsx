import ListingsView from "../ListingsView";
import { loadListingsFor } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function BuyPage() {
  const listings = await loadListingsFor("buy");
  return <ListingsView title="Homes to buy" listings={listings} />;
}
