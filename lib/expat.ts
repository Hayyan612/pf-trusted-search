/**
 * Expat guide: Dubai renting terms and an estimate of move-in cash.
 * Figures come from public renting guides (Property Finder, Bayut, Gulf News, agency guides) checked on 25 Nov 2026.
 * They vary by source, so the app shows ranges and says "check with the agent / DEWA".
 */

export interface Term {
  key: string;
  term: string;
  plain: string;
  tip: string;
}

export const GLOSSARY: Term[] = [
  { key: "ejari", term: "Ejari", plain: "The government registration of your tenancy contract. Every legal lease in Dubai must be registered.", tip: "You need it to connect DEWA and for many visa steps. Usually about AED 220, depending on where it is done." },
  { key: "dewa", term: "DEWA", plain: "Dubai Electricity and Water Authority. You open an account in your name for electricity and water.", tip: "Refundable deposit about AED 2,000 for an apartment, plus small connection fees." },
  { key: "housing-fee", term: "Housing fee (5%)", plain: "A Dubai Municipality fee of 5% of your yearly rent, added to your DEWA bill in 12 monthly parts.", tip: "Not upfront, but it is real money: on AED 120,000 rent that is about AED 500 a month." },
  { key: "cheques", term: "1, 4 or 12 cheques", plain: "Rent is paid with post-dated cheques for the year. Fewer cheques usually means a lower rent; 12 cheques, if offered, usually costs more.", tip: "Guides put the gap at roughly 5-10% between 1 and 4 cheques. It is negotiable; there is no legal fixed number." },
  { key: "chiller", term: "Chiller-free", plain: "Air conditioning (district cooling) is included in the rent. If not, you pay a cooling provider like Empower separately.", tip: "In the Marina, guides estimate AED 400-700 a month for a 1-bed, more in summer, plus a cooling deposit. None of the 144 rental ads in Princess Tower say whether cooling is included, so Scout asks." },
  { key: "deposit", term: "Security deposit", plain: "Held by the landlord and returned at the end, minus damage.", tip: "Usually 5% of yearly rent unfurnished, 10% furnished." },
  { key: "agency-fee", term: "Agency fee", plain: "The agent's commission, paid by the tenant once at signing.", tip: "Usually about 5% of the yearly rent. Ask for it in writing before the viewing." },
  { key: "rera", term: "RERA rental index", plain: "The Dubai Land Department's reference for fair rents. Renewal increases are capped against it.", tip: "Useful when renewing: a landlord cannot raise the rent freely each year." },
  { key: "permit", term: "Trakheesi permit / QR", plain: "Every property ad in Dubai needs a government advertising permit, shown as a QR code on the original ad.", tip: "Scanning it shows the official permit card. A permit shows the ad is legal, not that the flat is still free." },
  { key: "tenanted", term: "Tenanted / vacant on transfer", plain: "Tenanted means someone already lives there under a lease. For buyers, vacant on transfer means you get it empty.", tip: "For renters: ask the real move-in date. For investors: a tenant can mean rent from day one." },
];

export interface UpfrontLine {
  label: string;
  low: number;
  high: number;
  note: string;
  termKey?: string;
}

/** Estimated cash needed on signing for a yearly rental. Ranges, not quotes. */
export function upfrontCost(rent: number, cheques: number, furnished: string | null): { lines: UpfrontLine[]; low: number; high: number; monthly: UpfrontLine[] } {
  const first = Math.round(rent / cheques);
  const dep = furnished === "YES" || furnished === "PARTLY" ? 0.1 : 0.05;
  const lines: UpfrontLine[] = [
    { label: `First rent cheque (1 of ${cheques})`, low: first, high: first, note: cheques === 1 ? "The full year, paid at signing" : `AED ${rent.toLocaleString("en-US")} ÷ ${cheques}`, termKey: "cheques" },
    { label: `Security deposit (${dep * 100}%)`, low: Math.round(rent * dep), high: Math.round(rent * dep), note: dep === 0.1 ? "Furnished: usually 10%" : "Unfurnished: usually 5%", termKey: "deposit" },
    { label: "Agency fee (about 5%)", low: Math.round(rent * 0.05), high: Math.round(rent * 0.05), note: "Paid once to the agent", termKey: "agency-fee" },
    { label: "Ejari registration", low: 180, high: 350, note: "Depends on where it is registered", termKey: "ejari" },
    { label: "DEWA deposit and connection", low: 2_130, high: 2_160, note: "Deposit is refundable", termKey: "dewa" },
    { label: "Cooling deposit, if not chiller-free", low: 0, high: 2_000, note: "Ask the agent: none of these ads say", termKey: "chiller" },
  ];
  const monthly: UpfrontLine[] = [
    { label: "Housing fee (5% of rent, via DEWA)", low: Math.round((rent * 0.05) / 12), high: Math.round((rent * 0.05) / 12), note: "Every month", termKey: "housing-fee" },
    { label: "Cooling, if not chiller-free", low: 400, high: 1_000, note: "Guide estimates for the Marina; more in summer", termKey: "chiller" },
  ];
  return { lines, low: lines.reduce((s, l) => s + l.low, 0), high: lines.reduce((s, l) => s + l.high, 0), monthly };
}

export const EXPAT_SOURCES = [
  { label: "Property Finder: the additional costs of renting", url: "https://www.propertyfinder.ae/blog/look-out-for-the-6-hidden-costs-of-renting-in-dubai/" },
  { label: "Bayut: all about Empower", url: "https://www.bayut.com/mybayut/all-about-empower-dubai/" },
  { label: "Gulf News: how much is the security deposit", url: "https://gulfnews.com/living-in-uae/housing/renting-a-home-in-dubai-how-much-is-the-security-deposit-1.1716906865349" },
];
