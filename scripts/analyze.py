"""Audit signals over Princess Tower listings (data/raw/princess.json)."""
import json, re, statistics, os, sys
from collections import defaultdict
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, "data/raw/princess.json")))
TODAY = datetime(2026, 11, 25, tzinfo=timezone.utc)

def norm(p, kind):
    d = re.sub(r"\s+", " ", p.get("description") or "")
    size = (p.get("size") or {}).get("value")
    price = (p.get("price") or {}).get("value")
    listed = p.get("listed_date")
    age = (TODAY - datetime.fromisoformat(listed.replace("Z", "+00:00"))).days if listed else None
    return dict(id=str(p["id"]), kind=kind, price=price, period=(p.get("price") or {}).get("period"),
        beds=str(p.get("bedrooms")), baths=str(p.get("bathrooms")), size=size,
        ppsf=round(price / size) if price and size else None, furnished=p.get("furnished"),
        agent=(p.get("agent") or {}).get("name"), broker=(p.get("broker") or {}).get("name"),
        verified=p.get("is_verified"), age_days=age, listed=(listed or "")[:10], ref=p.get("reference"),
        imgs=p.get("images_count"), level=p.get("listing_level"), title=p.get("title"),
        url="https://www.propertyfinder.ae" + (p.get("details_path") or ""), desc=d)

rows = [norm(p, "rent") for p in data["rent"]] + [norm(p, "sale") for p in data["sale"]]

# median price per sqft per kind+beds
groups = defaultdict(list)
for r in rows:
    if r["ppsf"]: groups[(r["kind"], r["beds"])].append(r["ppsf"])
med = {k: statistics.median(v) for k, v in groups.items()}

# duplicate clusters: same kind, beds, size within 3 sqft
clusters = defaultdict(list)
for r in rows:
    if r["size"]: clusters[(r["kind"], r["beds"], round(r["size"] / 3))].append(r)

SHORT = re.compile(r"bills included|holiday home|vacation home|serviced|pay monthly|monthly|short[- ]?term|per night", re.I)
LATER = re.compile(r"(?:vacant|available)\s+(?:on|from|in|by)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Z][a-z]+(?:\s+20\d\d)?|[A-Z][a-z]+(?:\s+20\d\d)?)", re.I)
TEN = re.compile(r"tenanted|tenant in place|currently (?:rented|leased)|rented until", re.I)
for r in rows:
    f = []
    m = med.get((r["kind"], r["beds"]))
    r["vs_median"] = round(100 * (r["ppsf"] / m - 1)) if m and r["ppsf"] else None
    if r["vs_median"] is not None and r["vs_median"] <= -15: f.append(f"PRICE_LOW {r['vs_median']}%")
    if r["vs_median"] is not None and r["vs_median"] >= 30: f.append(f"PRICE_HIGH +{r['vs_median']}%")
    if r["kind"] == "rent" and SHORT.search(r["desc"] + " " + (r["broker"] or "") + " " + r["title"]): f.append("SHORT_STAY_AS_YEARLY")
    lm = LATER.search(r["desc"]);  
    if lm: f.append("AVAILABLE_LATER: " + lm.group(1))
    if TEN.search(r["desc"]): f.append("TENANTED")
    if r["age_days"] is not None and r["age_days"] > 90: f.append(f"OLD {r['age_days']}d")
    if not r["verified"]: f.append("NOT_VERIFIED")
    r["flags"] = f
for k, c in clusters.items():
    agents = {x["broker"] for x in c}
    if len(c) > 1 and len(agents) > 1:
        prices = [x["price"] for x in c]
        for x in c:
            x["flags"].append(f"SAME_SIZE_x{len(c)} ({len(agents)} agencies, AED {min(prices):,}-{max(prices):,})")
            x["cluster"] = f"{k[0]}-{k[1]}br-{k[2]*3}"

json.dump(rows, open(os.path.join(ROOT, "data/listings.analyzed.json"), "w"), indent=1)
print("rows", len(rows))
for k, v in sorted(med.items()): print("median AED/sqft", k, v, "n=", len(groups[k]))
from collections import Counter
cnt = Counter(f.split(" ")[0].split(":")[0] for r in rows for f in r["flags"])
print(cnt.most_common())
print("listings with >=1 flag:", sum(1 for r in rows if r["flags"]), "/", len(rows))
