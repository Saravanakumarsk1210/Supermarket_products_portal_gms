import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.paths import FRONTEND_DIR, PRODUCT_UPLOADS_DIR
from app.routers import admin, auth, catalog, contact, newsletter

settings = get_settings()
logger = logging.getLogger("gms")

HTML_PAGES = [
    "index.html",
    "products.html",
    "basket.html",
    "about.html",
    "contact.html",
]


async def _warmup_catalog_cache() -> None:
    """Pre-populate the in-memory catalog cache so the first visitor never waits."""
    try:
        from app.routers.catalog import _load_catalog_metadata, _load_active_products
        async with AsyncSessionLocal() as db:
            await _load_catalog_metadata(db)
        async with AsyncSessionLocal() as db:
            await _load_active_products(db)
        logger.info("Catalog cache warmed up on startup.")
    except Exception as exc:
        logger.warning("Startup cache warmup failed (will retry on first request): %s", exc)


async def _warmup_admin_cache() -> None:
    """Pre-populate admin API caches so the portal feels instant on first click."""
    try:
        from app.core.db_indexes import ensure_performance_indexes
        from app.routers.admin import warm_admin_cache
        async with AsyncSessionLocal() as db:
            await ensure_performance_indexes(db)
        async with AsyncSessionLocal() as db:
            await warm_admin_cache(db)
        logger.info("Admin cache warmed up on startup.")
    except Exception as exc:
        logger.warning("Admin cache warmup failed (will retry on first request): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(_warmup_catalog_cache())
    asyncio.create_task(_warmup_admin_cache())
    yield


app = FastAPI(
    title="GMS World Foods API",
    description="REST API for GMS World Foods supermarket e-commerce",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(auth.router)
app.include_router(newsletter.router)
app.include_router(contact.router)
app.include_router(admin.router)


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "gms-world-foods"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=404, content={"detail": str(exc.detail) if hasattr(exc, "detail") else "Not found"})
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


for folder in ("css", "js", "assets"):
    path = FRONTEND_DIR / folder
    if path.exists():
        app.mount(f"/{folder}", StaticFiles(directory=str(path)), name=folder)

PRODUCT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(PRODUCT_UPLOADS_DIR.parent)), name="uploads")


@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/admin")
@app.get("/admin.html")
async def serve_admin_portal():
    """Admin portal — served on the same port as the customer site."""
    return FileResponse(FRONTEND_DIR / "admin.html")


for page in HTML_PAGES[1:]:
    route = f"/{page}"

    def make_handler(filename: str):
        async def handler():
            return FileResponse(FRONTEND_DIR / filename)

        return handler

    app.get(route)(make_handler(page))


@app.api_route("/api/{api_path:path}", methods=["POST", "PUT", "PATCH", "DELETE"])
async def api_unmatched(api_path: str):
    """Return 404 for unknown API mutations (avoids SPA catch-all 405)."""
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.get("/{page_path:path}")
async def spa_fallback(page_path: str):
    """Serve HTML pages without .html extension if file exists."""
    if page_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    candidate = FRONTEND_DIR / page_path
    if candidate.is_file():
        return FileResponse(candidate)
    html_candidate = FRONTEND_DIR / f"{page_path}.html"
    if html_candidate.is_file():
        return FileResponse(html_candidate)
    return JSONResponse(status_code=404, content={"detail": "Not found"})
