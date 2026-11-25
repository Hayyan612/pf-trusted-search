# /// script
# dependencies = ["imagehash"]
# ///
"""Turn the raw Princess Tower listings into the app's data: listings with TrueUnit checks, grouped into real units.

Inputs: data/raw/princess.json (scraped from propertyfinder.ae on 2026-11-25), data/photo-hashes.json.
Output: data/app-data.json
"""
import json, os, re, statistics
from collections import defaultdict
from datetime import datetime, timezone
import imagehash

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = json.load(open(os.path.join(ROOT, "data/raw/princess.json")))
hashes = json.load(open(os.path.join(ROOT, "data/photo-hashes.json")))
# Agent photo, SuperAgent flag, languages, agency logo, reference, amenities, more photos (same capture day)
extra = json.load(open(os.path.join(ROOT, "data/raw/extra.json")))
TODAY = datetime(2026, 11, 25, tzinfo=timezone.utc)
PHOTO_DISTANCE = 6          # perceptual-hash distance counted as "same photo"
SIZE_TOLERANCE = 3          # sq ft
LOW_PRICE = -15             # % below building median per sq ft
STALE_DAYS = 90

SHORT = re.compile(r"bills included|holiday home|vacation home|serviced|pay monthly|short[- ]?term|per night", re.I)
LATER = re.compile(r"(?:vacant|available)\s+(?:on|from|in|by)\s+((?:[0-9]{1,2}(?:st|nd|rd|th)?\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+20\d\d)?)", re.I)
TENANTED = re.compile(r"\btenanted\b|tenant in place|currently (?:rented|leased)|rented until", re.I)

def listing(p, kind):
    size = (p.get("size") or {}).get("value")
    price = (p.get("price") or {}).get("value")
    listed = p.get("listed_date")
    age = (TODAY - datetime.fromisoformat(listed.replace("Z", "+00:00"))).days if listed else None
    desc = re.sub(r"\s+", " ", p.get("description") or "")
    return {
        "id": str(p["id"]), "kind": kind, "price": price, "beds": int(p.get("bedrooms") or 0),
        "baths": int(p.get("bathrooms") or 0), "size": size, "ppsf": round(price / size) if price and size else None,
        "furnished": p.get("furnished"), "agent": (p.get("agent") or {}).get("name"),
        "broker": (p.get("broker") or {}).get("name"), "verified": bool(p.get("is_verified")),
        "listed": (listed or "")[:10], "ageDays": age, "imageCount": p.get("images_count"),
        "images": [u.split("?")[0] for u in (p.get("images") or []) if u][:3], "title": p.get("title"),
        "url": "https://www.propertyfinder.ae" + (p.get("details_path") or ""), "level": p.get("listing_level"),
        "description": desc[:1200],
    }

L = {}
for kind in ("rent", "sale"):
    for p in raw[kind]:
        x = listing(p, kind)
        e = extra.get(str(p["id"]), {})
        more = [u.split("?")[0] for u in (e.get("images") or []) if u]
        x.update({
            "images": more or x["images"],
            "imageCount": e.get("imageCount") or x["imageCount"],
            "agentImage": (e.get("agentImage") or "").split("?")[0] or None,
            "agentSuper": bool(e.get("agentSuper")),
            "agentLanguages": e.get("agentLanguages") or [],
            "brokerLogo": (e.get("brokerLogo") or "").split("?")[0] or None,
            "reference": e.get("reference") or p.get("reference"),
            "amenities": e.get("amenities") or [],
        })
        L[str(p["id"])] = x

# building medians (AED per sq ft) by purpose and bedrooms
groups = defaultdict(list)
for x in L.values():
    if x["ppsf"]: groups[(x["kind"], x["beds"])].append(x["ppsf"])
median = {k: statistics.median(v) for k, v in groups.items()}

# photo matches between listings
H = [(i, imagehash.hex_to_hash(h)) for k, i, n, u, h in hashes if h and i in L]
shared = defaultdict(lambda: defaultdict(int))
for a in range(len(H)):
    for b in range(a + 1, len(H)):
        if H[a][0] != H[b][0] and H[a][1] - H[b][1] <= PHOTO_DISTANCE:
            shared[H[a][0]][H[b][0]] += 1; shared[H[b][0]][H[a][0]] += 1

def same_unit(a, b):
    return a["beds"] == b["beds"] and a["size"] and b["size"] and abs(a["size"] - b["size"]) <= SIZE_TOLERANCE

# union-find: same purpose + same photos + same size/beds => one real unit
parent = {i: i for i in L}
def find(i):
    while parent[i] != i: parent[i] = parent[parent[i]]; i = parent[i]
    return i
for a, others in shared.items():
    for b in others:
        if L[a]["kind"] == L[b]["kind"] and same_unit(L[a], L[b]): parent[find(a)] = find(b)

for x in L.values():
    checks = []   # {code, severity: ok|ask|hide, label, detail}
    m = median.get((x["kind"], x["beds"]))
    vs = round(100 * (x["ppsf"] / m - 1)) if m and x["ppsf"] else None
    x["vsMedian"], x["medianPpsf"] = vs, m
    if vs is not None and vs <= LOW_PRICE:
        checks.append({"code": "price_low", "severity": "ask", "label": f"Price {abs(vs)}% below similar flats",
                       "detail": f"AED {x['ppsf']}/sq ft vs AED {round(m)}/sq ft median for {x['beds']}-bed {'rentals' if x['kind']=='rent' else 'sales'} in this tower. Could be a real deal or bait to get calls."})
    elif vs is not None and abs(vs) <= 10:
        checks.append({"code": "price_ok", "severity": "ok", "label": "Price in line with similar flats", "detail": f"Within {abs(vs)}% of the tower median per sq ft."})
    for o, n in shared.get(x["id"], {}).items():
        y = L[o]
        if not same_unit(x, y):
            if n >= 2:
                checks.append({"code": "photos_other_unit", "severity": "hide", "label": "Photos belong to a different flat",
                               "detail": f"{n} photos match listing #{o} ({y['beds']}-bed, {y['size']:,} sq ft, {y['broker']}). The photos may not show this flat.", "other": o})
            else:
                checks.append({"code": "photo_similar", "severity": "ask", "label": "One photo matches another flat",
                               "detail": f"One photo looks like listing #{o}. Often a shared view shot from the tower, so not proof on its own.", "other": o})
        elif y["kind"] != x["kind"]:
            checks.append({"code": "dual_listed", "severity": "ask", "label": f"Same flat is also for {'sale' if y['kind']=='sale' else 'rent'}",
                           "detail": f"Listing #{o} shows the same flat {'for sale at' if y['kind']=='sale' else 'for rent at'} AED {y['price']:,}. Ask whether the owner has committed to {'renting' if x['kind']=='rent' else 'selling'}.", "other": o})
    if x["kind"] == "rent" and SHORT.search(" ".join([x["description"], x["broker"] or "", x["title"] or ""])):
        checks.append({"code": "short_stay", "severity": "ask", "label": "Looks like holiday-home pricing",
                       "detail": "Mentions bills included, serviced or a holiday-home operator. The yearly price may be a monthly-stay rate added up, not a normal Ejari tenancy."})
    mt = LATER.search(x["description"])
    if TENANTED.search(x["description"]):
        checks.append({"code": "tenanted", "severity": "ask", "label": "Description says it is tenanted", "detail": "Someone may still live there. Ask when it is really free."})
    elif mt:
        checks.append({"code": "available_later", "severity": "ask", "label": f"Available {mt.group(1)}", "detail": "The ad text gives a later date than the listing suggests. Check it is still free on that date."})
    if x["ageDays"] is not None and x["ageDays"] > STALE_DAYS:
        checks.append({"code": "stale", "severity": "ask", "label": f"Listed {x['ageDays']} days ago", "detail": "Long-running ads are often already let or sold."})
    if x["verified"]:
        checks.append({"code": "verified", "severity": "ok", "label": "Verified badge on Property Finder", "detail": "Passed Property Finder's listing checks when it was posted. That does not confirm it is still available today."})
    sev = "hide" if any(c["severity"] == "hide" for c in checks) else "ask" if any(c["severity"] == "ask" for c in checks) else "ok"
    x["checks"], x["status"] = checks, sev
    x["unitId"] = "u" + find(x["id"])

units = defaultdict(list)
for x in L.values(): units[x["unitId"]].append(x["id"])
unit_list = []
for uid, ids in units.items():
    ls = sorted((L[i] for i in ids), key=lambda z: z["price"])
    best = next((z for z in ls if z["status"] != "hide"), ls[0])
    unit_list.append({"id": uid, "kind": ls[0]["kind"], "beds": ls[0]["beds"], "size": ls[0]["size"], "listingIds": [z["id"] for z in ls],
                      "priceMin": ls[0]["price"], "priceMax": ls[-1]["price"], "agencies": len({z["broker"] for z in ls}), "bestId": best["id"]})
for u in unit_list:
    if len(u["listingIds"]) > 1:
        for i in u["listingIds"]:
            o = [j for j in u["listingIds"] if j != i]
            L[i]["checks"].insert(0, {"code": "same_unit", "severity": "ask" if u["priceMin"] != u["priceMax"] else "ok",
                "label": f"Same flat advertised {len(u['listingIds'])} times",
                "detail": f"{u['agencies']} {'agency' if u['agencies']==1 else 'agencies'}, AED {u['priceMin']:,} to {u['priceMax']:,}. TrueUnit shows it once.", "others": o})
            if L[i]["status"] == "ok" and u["priceMin"] != u["priceMax"]: L[i]["status"] = "ask"

out = {"building": "Princess Tower, Dubai Marina", "capturedAt": "2026-11-25",
       "medians": {f"{k[0]}-{k[1]}": v for k, v in median.items()},
       "listings": list(L.values()), "units": unit_list}
json.dump(out, open(os.path.join(ROOT, "data/app-data.json"), "w"))
from collections import Counter
print("listings", len(L), "units", len(unit_list), "multi-ad units", sum(1 for u in unit_list if len(u["listingIds"]) > 1))
print(Counter((x["kind"], x["status"]) for x in L.values()))
print(Counter(c["code"] for x in L.values() for c in x["checks"]))
