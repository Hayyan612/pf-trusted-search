# /// script
# dependencies = ["imagehash"]
# ///
"""Build data/audit.json + AUDIT.md: photo reuse, price vs building median, availability, short-stay signals."""
import json, os, re
from collections import defaultdict
import imagehash
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = {r["id"]: r for r in json.load(open(os.path.join(ROOT, "data/listings.analyzed.json")))}
hashes = json.load(open(os.path.join(ROOT, "data/photo-hashes.json")))
H = [(i, imagehash.hex_to_hash(h)) for k, i, n, u, h in hashes if h]
share = defaultdict(set)
for a in range(len(H)):
    for b in range(a + 1, len(H)):
        if H[a][0] != H[b][0] and H[a][1] - H[b][1] <= 6:
            share[H[a][0]].add(H[b][0]); share[H[b][0]].add(H[a][0])

def size_close(a, b): return a["size"] and b["size"] and abs(a["size"] - b["size"]) <= 3

for r in rows.values():
    notes, sev = [], 0  # sev: 0 ok, 1 ask agent, 2 hide
    # photos
    for o in sorted(share.get(r["id"], [])):
        x = rows[o]
        same_unit = size_close(r, x) and r["beds"] == x["beds"]
        if not same_unit:
            notes.append(f"Photos also used on #{o} ({x['beds']}BR, {x['size']} sqft, {x['broker']}): photos may not show this unit"); sev = max(sev, 2)
        elif x["kind"] != r["kind"]:
            notes.append(f"Same unit also listed for {x['kind']} (#{o}, AED {x['price']:,}) by {x['broker']}"); sev = max(sev, 1)
        elif x["broker"] != r["broker"] or x["price"] != r["price"]:
            notes.append(f"Same unit listed again as #{o} by {x['broker']} at AED {x['price']:,}"); sev = max(sev, 1)
    # price
    v = r.get("vs_median")
    if v is not None and v <= -15: notes.append(f"Price per sqft {abs(v)}% below building median"); sev = max(sev, 1)
    if v is not None and v >= 30: notes.append(f"Price per sqft {v}% above building median")
    # availability / type
    for f in r["flags"]:
        if f.startswith("SHORT_STAY"): notes.append("Holiday-home / bills-included pricing shown as a yearly rent"); sev = max(sev, 1)
        if f.startswith("AVAILABLE_LATER"): notes.append("Description says available " + f.split(": ", 1)[1].strip()); sev = max(sev, 1)
        if f == "TENANTED": notes.append("Description says the unit is tenanted"); sev = max(sev, 1)
        if f.startswith("OLD"): notes.append(f"Listed {r['age_days']} days ago"); sev = max(sev, 1)
        if f == "NOT_VERIFIED": notes.append("No Verified badge")
    r["audit_notes"] = notes
    r["verdict"] = ["Shortlist", "Ask the agent first", "Hide (likely misleading)"][sev]
    r["photo_links"] = sorted(share.get(r["id"], []))

json.dump(list(rows.values()), open(os.path.join(ROOT, "data/listings.audited.json"), "w"), indent=1)
from collections import Counter
print(Counter(r["verdict"] for r in rows.values()))
print(Counter((r["kind"], r["verdict"]) for r in rows.values()))
