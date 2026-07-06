"""Central project path constants."""

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
UPLOADS_DIR = FRONTEND_DIR / "uploads"
PRODUCT_UPLOADS_DIR = UPLOADS_DIR / "products"
DATABASE_DIR = PROJECT_ROOT / "database"
SEED_DIR = DATABASE_DIR / "seed"
SCHEMA_FILE = DATABASE_DIR / "schema.sql"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
DATA_DIR = PROJECT_ROOT / "data"
CATALOG_CSV_DIR = DATA_DIR / "catalog"
SOURCE_IMAGES_DIR = DATA_DIR / "source-images"
CATEGORY_SOURCE_IMAGES_DIR = SOURCE_IMAGES_DIR / "categories"
HERO_BANNER_SOURCE_DIR = SOURCE_IMAGES_DIR / "hero-banners"
CULTURE_BANNER_SOURCE_DIR = SOURCE_IMAGES_DIR / "culture-banners"
PROMO_BANNERS_DIR = FRONTEND_DIR / "assets" / "promotion-banners"
