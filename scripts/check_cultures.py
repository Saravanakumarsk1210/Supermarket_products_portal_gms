import asyncio, sys
sys.path.insert(0, "E:/SUPER_MARKET_V1")

async def check():
    from app.core.db import AsyncSessionLocal
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        r = await db.execute(text(
            "SELECT kitchen_culture, COUNT(*) c FROM products "
            "WHERE kitchen_culture IS NOT NULL GROUP BY kitchen_culture ORDER BY c DESC"
        ))
        rows = r.fetchall()
        for row in rows:
            print(f"{row[0]}: {row[1]}")
        total_r = await db.execute(text(
            "SELECT COUNT(*) FROM products WHERE kitchen_culture IS NOT NULL"
        ))
        print(f"\nTotal with culture: {total_r.scalar_one()}")
        # check a specific product we know should have chinese culture
        sample = await db.execute(text(
            "SELECT product_name, kitchen_culture FROM products "
            "WHERE product_name ILIKE '%nongshim%' LIMIT 5"
        ))
        print("\nNongshim products:")
        for row in sample.fetchall():
            print(f"  {row[0]} -> {row[1]!r}")

asyncio.run(check())
