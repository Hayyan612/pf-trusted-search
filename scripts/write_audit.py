"""Write AUDIT.md from data/app-data.json. Hand-check notes are added for the pairs checked by eye in evidence/pairs-*.jpg."""
import json, os
from collections import Counter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "data/app-data.json"))); L = {x["id"]: x for x in d["listings"]}
EYE = {  # checked by eye on 2026-11-25 (evidence/pairs-1.jpg, pairs-6.jpg, data/sheet.jpg)
 "175116789": "Same living-room photo as #175575155 (Seafront), which says 1,305 sq ft; this ad says 1,189",
 "175575155": "Same living-room photo as #175116789 (McCone, 1,189 sq ft): one of the two sizes is wrong",
 "156896145": "Identical photo, re-watermarked, as #177340918 (White & Co) at AED 2.1M",
 "177340918": "Identical photo, re-watermarked, as #156896145 (YHU) at AED 2.0M",
 "171029353": "Same sunset photo as #161852376 (Dacha) at AED 4.5M",
 "161852376": "Same sunset photo as #171029353 (Huspy) at AED 4.3M",
 "163243148": "Same living-room photo as #97841323, a sale ad by Keys at AED 3.0M",
 "97841323": "Same living-room photo as #163243148, a rent ad by ALH at AED 264k",
 "165059354": "All first 3 photos identical to #175131725, which is a different size (1,182 sq ft) at AED 2.7M",
 "175131725": "All first 3 photos identical to #165059354 (1,305 sq ft, AED 2.0M)",
 "169274924": "Matched #169274661 on one sea-view photo only; interiors differ. Not reuse (rule refined)",
 "169274661": "Matched #169274924 on one sea-view photo only; interiors differ. Not reuse (rule refined)",
}
def yn(b): return "Yes" if b else "No"
picked = []
for x in d["listings"]:
    codes = {c["code"] for c in x["checks"]}
    if x["id"] in EYE or codes & {"photos_other_unit", "same_unit", "dual_listed", "short_stay", "tenanted", "price_low", "below_registered", "available_later"}:
        picked.append(x)
clean = [x for x in d["listings"] if x["status"] == "ok"][:6]
rows = picked + clean
lines = ["# Audit: Princess Tower, Dubai Marina", "",
 f"Captured from propertyfinder.ae on {d['capturedAt']}: **{len(d['listings'])} live ads** ({sum(x['kind']=='rent' for x in d['listings'])} rent, {sum(x['kind']=='sale' for x in d['listings'])} sale). Every ad went through the same checks by script (`scripts/build_data.py`). Photo matches were then checked by eye (`evidence/`).", "",
 "Only what a person searching can see was used: price, size, bedrooms, photos, the ad text, the agent and agency, the listing date and badges.", "",
 "## Totals", "",
 "| | Rent | Sale |", "|---|---|---|"]
for st, name in (("ok", "Looks genuine"), ("ask", "Ask the agent first"), ("hide", "Likely misleading")):
    lines.append(f"| {name} | {sum(1 for x in d['listings'] if x['kind']=='rent' and x['status']==st)} | {sum(1 for x in d['listings'] if x['kind']=='sale' and x['status']==st)} |")
cnt = Counter(c["code"] for x in d["listings"] for c in x["checks"])
lines += ["", "Signals found across all ads:", ""]
names = {"verified": "Verified badge", "price_ok": "Price within 10% of tower median", "stale": "Listed more than 90 days ago", "dual_listed": "Same flat listed for rent and for sale", "same_unit": "Same flat advertised more than once (photos + size + beds)", "tenanted": "Ad text says tenanted", "short_stay": "Holiday-home / bills-included pricing as a yearly rent", "price_low": "Price per sq ft 15%+ below tower median", "photo_similar": "One photo matches another flat", "photos_other_unit": "2+ photos match a different flat", "available_later": "Ad text gives a later availability date"}
for k, v in cnt.most_common(): lines.append(f"- {names.get(k,k)}: {v}")
import statistics as st
for k in ("rent", "sale"):
    xs = [x for x in d["listings"] if x["kind"] == k and x.get("vsRegistered") is not None]
    if xs: lines.append(f"- {k.capitalize()} ads vs registered deals: median {st.median(x['vsRegistered'] for x in xs):+.0f}%, {sum(1 for x in xs if x['vsRegistered'] >= 15)} of {len(xs)} ask 15%+ more")
lines += ["", f"All {sum(1 for x in d['listings'] if x['status']=='hide')} ads marked likely misleading carry Property Finder's Verified badge.", "",
 f"## Listing by listing ({len(rows)} ads)", "",
 "\"vs registered deals\" compares the ad with the median of the last 5 registered rents or sales for the same size (DLD records shown on Property Finder via DataGuru). \"vs live ads\" compares price per sq ft with today's other ads for the same bedrooms.", "",
 "| # | Ad | Rent/Sale | Beds, sq ft | Price (AED) | vs registered deals | vs live ads | Same flat listed again? | Photos match this flat? | Likely available? | Anything else | Checked by eye | TrueUnit |",
 "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
for n, x in enumerate(rows, 1):
    codes = {c["code"]: c for c in x["checks"]}
    same = codes.get("same_unit", {}).get("detail") or (codes["dual_listed"]["label"] if "dual_listed" in codes else "No")
    photos = "No: " + codes["photos_other_unit"]["detail"] if "photos_other_unit" in codes else ("Unclear: one shared photo" if "photo_similar" in codes else "No match found")
    avail = "; ".join(codes[k]["label"] for k in ("tenanted", "available_later", "stale") if k in codes) or "Nothing says otherwise"
    other = "; ".join(codes[k]["label"] for k in ("short_stay", "price_low") if k in codes) + ("" if x["verified"] else "; no Verified badge")
    vs = "" if x["vsMedian"] is None else f"{x['vsMedian']:+d}%"
    vr = "" if x.get("vsRegistered") is None else f"{x['vsRegistered']:+d}%"
    verdict = {"ok": "Looks genuine", "ask": "Ask first", "hide": "Hide"}[x["status"]]
    lines.append(f"| {n} | [{x['id']}]({x['url']}) | {x['kind']} | {x['beds']}, {x['size']:,} | {x['price']:,} | {vr} | {vs} | {same} | {photos} | {avail} | {other.strip('; ') or '-'} | {EYE.get(x['id'], '')} | {verdict} |")
open(os.path.join(ROOT, "AUDIT.md"), "w").write("\n".join(lines) + "\n")
print(len(rows), "rows")
