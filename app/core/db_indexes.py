"""One-time idempotent DB indexes for admin search and catalog performance."""

import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("gms")


async def ensure_performance_indexes(db: AsyncSession) -> None:
    """Create extensions/indexes used by admin product search (safe to re-run)."""
    statements = [
        "CREATE EXTENSION IF NOT EXISTS pg_trgm",
        """
        CREATE INDEX IF NOT EXISTS idx_products_name_trgm
        ON products USING gin (product_name gin_trgm_ops)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_products_brand_trgm
        ON products USING gin (brand gin_trgm_ops)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_products_active_name
        ON products (product_name)
        WHERE is_active = true
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_products_active_category
        ON products (category_id)
        WHERE is_active = true
        """,
        """
        ALTER TABLE site_banners
        ADD COLUMN IF NOT EXISTS prev_banner_id INTEGER
        REFERENCES site_banners(id) ON DELETE SET NULL
        """,
        """
        ALTER TABLE site_banners
        ADD COLUMN IF NOT EXISTS next_banner_id INTEGER
        REFERENCES site_banners(id) ON DELETE SET NULL
        """,
        """
        CREATE TABLE IF NOT EXISTS culture_banners (
            id              SERIAL PRIMARY KEY,
            title           VARCHAR(150) NOT NULL,
            image_url       TEXT NOT NULL,
            link_url        TEXT,
            is_active       BOOLEAN DEFAULT TRUE,
            display_order   SMALLINT DEFAULT 0,
            prev_culture_id INTEGER REFERENCES culture_banners(id) ON DELETE SET NULL,
            next_culture_id INTEGER REFERENCES culture_banners(id) ON DELETE SET NULL,
            created_at      TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        """
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS kitchen_culture VARCHAR(30)
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_products_kitchen_culture
        ON products (kitchen_culture)
        WHERE kitchen_culture IS NOT NULL
        """,
        """
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id           SERIAL PRIMARY KEY,
            name         VARCHAR(150) NOT NULL,
            email        VARCHAR(255) NOT NULL,
            phone        VARCHAR(30),
            enquiry_type VARCHAR(100),
            message      TEXT NOT NULL,
            is_read      BOOLEAN DEFAULT FALSE,
            submitted_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at
        ON contact_submissions (submitted_at DESC)
        """,
    ]
    for stmt in statements:
        try:
            await db.execute(text(stmt))
        except Exception as exc:
            logger.warning("Index setup skipped: %s", exc)
    await db.commit()
