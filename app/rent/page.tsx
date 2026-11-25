import ListingsView from "../ListingsView";
import { loadListingsFor } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function RentPage() {
  const listings = await loadListingsFor("rent");
  return <ListingsView title="Homes to rent" listings={listings} />;
}
