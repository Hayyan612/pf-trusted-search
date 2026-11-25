# /// script
# dependencies = ["pillow", "imagehash", "requests"]
# ///
"""Perceptual-hash the first 3 photos of every listing and find near-identical photos across listings."""
import json, os, re, io
from concurrent.futures import ThreadPoolExecutor
import requests, imagehash
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "data/raw/princess.json")))
jobs = []
for kind in ("rent", "sale"):
    for p in d[kind]:
        for i, u in enumerate((p.get("images") or [])[:3]):
            if u: jobs.append((kind, str(p["id"]), i, u.split("?")[0]))
def h(job):
    try:
        r = requests.get(job[3], timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        return job + (str(imagehash.phash(Image.open(io.BytesIO(r.content)))),)
    except Exception as e:
        return job + (None,)
with ThreadPoolExecutor(16) as ex: res = list(ex.map(h, jobs))
json.dump(res, open(os.path.join(ROOT, "data/photo-hashes.json"), "w"))
ok = [r for r in res if r[4]]
print("hashed", len(ok), "of", len(res))
