"""Central project path constants."""

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
UPLOADS_DIR = FRONTEND_DIR / "uploads"
PRODUCT_UPLOADS_DIR = UPLOADS_DIR / "products"
DATABASE_DIR = PROJECT_ROOT / "database"
SEED_DIR = DATABASE_DIR / "seed"
SCHEMA_FILE = DATABASE_DIR / "schema.sql"
PROMO_BANNERS_DIR = FRONTEND_DIR / "assets" / "promotion-banners"
