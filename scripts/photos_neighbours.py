# /// script
# dependencies = ["pillow", "imagehash", "requests"]
# ///
"""Photos vs building: fingerprint photos from 8 neighbouring Dubai Marina towers and find Princess Tower ads using them."""
import io, json, os
from concurrent.futures import ThreadPoolExecutor
import imagehash, requests
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
nb = json.load(open(os.path.join(ROOT, "data/raw/neighbours.json")))
jobs = [(pid, i, u.split("?")[0]) for pid, v in nb.items() for i, u in enumerate((v.get("images") or [])[:3]) if u]

def h(job):
    try:
        r = requests.get(job[2], timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        return job + (str(imagehash.phash(Image.open(io.BytesIO(r.content)))),)
    except Exception:
        return job + (None,)

with ThreadPoolExecutor(16) as ex:
    res = list(ex.map(h, jobs))
json.dump(res, open(os.path.join(ROOT, "data/photo-hashes-neighbours.json"), "w"))
print("hashed", sum(1 for r in res if r[3]), "of", len(res))

pt = json.load(open(os.path.join(ROOT, "data/photo-hashes.json")))
P = [(i, n, imagehash.hex_to_hash(hh)) for k, i, n, u, hh in pt if hh]
N = [(pid, n, imagehash.hex_to_hash(hh)) for pid, n, u, hh in res if hh]
hits = {}
for pid_pt, n1, a in P:
    for pid_nb, n2, b in N:
        if a - b <= 6:
            hits.setdefault((pid_pt, pid_nb), 0)
            hits[(pid_pt, pid_nb)] += 1
out = [{"princessId": a, "otherId": b, "photos": c, "otherTower": nb[b]["tower"], "otherBroker": nb[b]["broker"], "otherPath": nb[b]["path"]} for (a, b), c in hits.items()]
json.dump(out, open(os.path.join(ROOT, "data/photo-other-buildings.json"), "w"), indent=1)
print("princess ads sharing a photo with another building:", len({o['princessId'] for o in out}))
for o in sorted(out, key=lambda o: -o["photos"])[:20]: print(o["photos"], o["princessId"], "->", o["otherTower"], o["otherBroker"], o["otherId"])
