# GMS World Foods — FastAPI + PostgreSQL

GMS World Foods supermarket e-commerce: FastAPI backend, PostgreSQL database, vanilla JS frontend.

## Project layout

```
SUPER_MARKET_V1/
├── app/                    # FastAPI backend
│   ├── main.py             # Customer site + admin portal (single server)
│   ├── config.py           # Settings from .env
│   ├── database.py         # Async SQLAlchemy
│   ├── paths.py            # Project path constants
│   ├── models/             # ORM (catalog, users, site)
│   ├── schemas/            # Pydantic request/response types
│   ├── routers/            # API route modules
│   └── core/               # Auth, catalog queries, pagination, Cloudinary
├── frontend/               # Static site + admin UI
│   ├── index.html          # Homepage
│   ├── products.html       # Product listing & filters
│   ├── basket.html         # Shopping basket
│   ├── bucket.html         # Redirect stub → basket.html (legacy URL)
│   ├── about.html, contact.html
│   ├── admin.html          # Admin dashboard
│   ├── css/                # main.css, admin.css
│   ├── js/                 # Customer + admin scripts
│   ├── assets/             # Store photo, culture icons (fallback images)
│   └── uploads/            # Local product image uploads (gitignored)
├── data/                   # Source data (not served at runtime)
│   ├── catalog/            # CSV files (categories, products, subcategories)
│   └── source-images/      # Original images for one-off Cloudinary upload scripts
├── database/
│   └── schema.sql          # PostgreSQL DDL reference
├── scripts/                # Maintenance scripts (seed, upload images)
├── run.py                  # Start server
├── requirements.txt
├── .env.example            # Copy to .env and fill in values
└── .env                    # Local secrets (not committed)
```

## Setup & run (Windows CMD)

```cmd
cd /d E:\SUPER_MARKET_V1
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python run.py
```

Open **http://127.0.0.1:8000** for the storefront and **http://127.0.0.1:8000/admin** for the admin portal. API docs: **http://127.0.0.1:8000/docs**

### Prerequisites

- Python 3.11+
- PostgreSQL (credentials in `.env`)

### Admin login

- **Email:** `admin@gmsworldfoods.local` (or username `admin` on admin page)
- **Password:** `gms2026`

## Architecture notes

- **Frontend** loads catalog data from `GET /api/v1/catalog/bootstrap` (no static `data/*.js`).
- **Filtering** is client-side on the cached `ALL_PRODUCTS[]` array.
- **Guest basket** uses `localStorage`; authenticated users can sync to PostgreSQL.
- **Coupons** stored in `site_settings` (`setting_key = coupons`).
- **Images** served from Cloudinary URLs (admin upload) or `/uploads/products/`.

## API endpoints

### Catalog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/catalog/bootstrap` | Full catalog for frontend init |
| GET | `/api/v1/categories` | Category stats |
| GET | `/api/v1/categories/{id}` | Single category |
| GET | `/api/v1/subcategories` | Subcategory stats (`?category_id=`) |
| GET | `/api/v1/products` | Paginated/filterable products |
| GET | `/api/v1/products/featured` | Featured products |
| GET | `/api/v1/products/best-sellers` | Best sellers |
| GET | `/api/v1/products/new-arrivals` | New arrivals |
| GET | `/api/v1/products/hot-offers` | Hot offers |
| GET | `/api/v1/products/exclusive` | Exclusive products |
| GET | `/api/v1/products/{id}` | Product detail |
| GET | `/api/v1/products/{id}/images` | Product images |
| GET | `/api/v1/banners` | Promotion banners |
| GET | `/api/v1/testimonials` | Customer testimonials |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login (Bearer token) |
| GET | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/auth/logout` | End session |

### Newsletter

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/newsletter/subscribe` | Subscribe email |

### Admin (`role = admin`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/stats` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/v1/admin/categories` | Categories |
| GET/POST | `/api/v1/admin/subcategories` | Subcategories |
| GET/POST/PUT/DELETE | `/api/v1/admin/products` | Products |
| GET/POST/PUT/DELETE | `/api/v1/admin/banners` | Banners |
| GET/PUT | `/api/v1/admin/coupons` | Coupon management |
| GET | `/api/v1/coupons/active` | Active coupons (basket) |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
