"""Upload category thumbnail images from 'My  categories' folder to Cloudinary."""
import os, sys
sys.path.insert(0, r"E:\SUPER_MARKET_V1")

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dgsnwhyah",
    api_key="132541329763823",
    api_secret="P_DCGb5ZysUbACdXVo3UlfUp6ds",
)

CATEGORIES = [
    "dry-grocery-staples",
    "snacks-confectionery",
    "beverages",
    "fresh-produce",
    "frozen-meat-ready-to-cook",
    "condiments-sauces-pickles",
    "dairy-eggs-chilled",
    "household-personal-care",
    "bakery-pasta-noodles",
]

BASE = r"E:\SUPER_MARKET_V1\My  categories"
results = {}

for i, slug in enumerate(CATEGORIES, start=1):
    fpath = os.path.join(BASE, f"{i}.png")
    public_id = f"gms-world-foods/categories/{slug}"
    print(f"[{i}/9] Uploading {fpath}  ->  {public_id}")
    r = cloudinary.uploader.upload(
        fpath,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    url = r["secure_url"]
    results[i] = (slug, url)
    print(f"      OK: {url}")

print("\n--- UPLOAD COMPLETE ---")
for idx, (slug, url) in results.items():
    print(f"{idx}. {slug}: {url}")
