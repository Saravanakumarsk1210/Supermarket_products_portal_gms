from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CategoryOut(BaseModel):
    ProductCategoryID: str
    CategoryName: str
    Product_Count: int
    Min_Price: float
    Max_Price: float
    Avg_Price: float
    Median_Price: float
    description: str | None = None


class SubcategoryOut(BaseModel):
    ProductCategoryID: str
    CategoryName: str
    ProductSubCategoryID: str
    SubCategoryName: str
    Product_Count: int
    Min_Price: float
    Max_Price: float
    Avg_Price: float
    Median_Price: float


class ProductOut(BaseModel):
    productId: str
    categoryId: str
    categoryName: str
    subCategoryId: str
    subCategoryName: str
    productName: str
    displayName: str
    weightKG: float | None = None
    packType: str = ""
    unitLabel: str = ""
    locationId: int = 52
    salesUnitTypeId: int = 1
    flaggedCategoryMismatch: bool = False
    productDescription: str = ""
    primaryImageUrl: str | None = None
    isFeatured: bool = False
    isBestSeller: bool = False
    isNewArrival: bool = False
    isHotOffer: bool = False
    isExclusive: bool = False
    discountPercent: int = 0
    kitchenCulture: str | None = None


class KitchenCultureOut(BaseModel):
    key: str
    label: str


class ProductListResponse(BaseModel):
    items: list[ProductOut]
    total_count: int
    total_pages: int
    current_page: int
    per_page: int


class ProductImageOut(BaseModel):
    id: int
    product_id: str
    image_url: str
    alt_text: str | None = None
    is_primary: bool
    display_order: int


class BannerOut(BaseModel):
    id: int
    title: str
    subtitle: str | None = None
    image_url: str
    link_url: str | None = None
    display_order: int


class CultureOut(BaseModel):
    id: int
    title: str
    image_url: str
    link_url: str | None = None
    display_order: int


class TestimonialOut(BaseModel):
    initials: str
    name: str
    text: str
    rating: int = 5


class NewsletterSubscribeIn(BaseModel):
    email: EmailStr


class AdminNewsletterCreateIn(BaseModel):
    email: EmailStr
    is_active: bool = True


class AdminNewsletterUpdateIn(BaseModel):
    email: EmailStr | None = None
    is_active: bool | None = None


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str


class AuthOut(BaseModel):
    session_token: str
    user: dict[str, Any]


class CatalogMetadataOut(BaseModel):
    categoryStats: list[dict]
    subcategoryStats: list[dict]
    promotionBannerImages: list[str]
    promotionBanners: list[dict] = []
    siteSettings: dict[str, str] = {}


class CatalogProductsBulkOut(BaseModel):
    products: list[dict]


class BootstrapOut(BaseModel):
    categoryStats: list[dict]
    subcategoryStats: list[dict]
    products: list[dict]
    productImageById: dict[str, str]
    productHomeImageById: dict[str, str]
    promotionBannerImages: list[str]
    promotionBanners: list[dict] = []
    siteSettings: dict[str, str] = {}


class AdminStatsOut(BaseModel):
    total_products: int
    total_categories: int
    total_subcategories: int
    flagged_products: int
    avg_price: float


class CouponOut(BaseModel):
    code: str
    type: str
    value: float
    min: float
    active: bool = True
