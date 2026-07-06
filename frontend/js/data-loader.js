const ALL_PRODUCTS = [];
const PRODUCT_BY_NAME = new Map();
const PRODUCT_BY_DISPLAY = new Map();
const PRODUCT_BY_ID = new Map();
let uniquePackTypes = [];
let uniqueLocationIds = [];

let CATEGORY_STATS = [];
let SUBCATEGORY_STATS = [];
let PRODUCT_IMAGE_BY_ID = {};
let PRODUCT_IMAGE_BY_NAME = {};
let PRODUCT_HOME_IMAGE_BY_ID = {};
let PRODUCT_HOME_IMAGE_BY_NAME = {};
let PROMOTION_BANNER_IMAGES = [];
let PROMOTION_BANNERS = [];

function setPromotionBanners(banners) {
    PROMOTION_BANNERS = Array.isArray(banners) ? banners : [];
    PROMOTION_BANNER_IMAGES = PROMOTION_BANNERS
        .map(b => (b && (b.imageUrl || b.image_url)) || '')
        .filter(Boolean);
}

function getPromotionBanners() {
    if (Array.isArray(PROMOTION_BANNERS) && PROMOTION_BANNERS.length) {
        return PROMOTION_BANNERS;
    }
    if (Array.isArray(window.PROMOTION_BANNERS) && window.PROMOTION_BANNERS.length) {
        return window.PROMOTION_BANNERS;
    }
    return [];
}

const API_BASE = '';
let _dataReadyPromise = null;
let _dataReady = false;

function formatDisplayName(str) {
    if (!str) return '';
    return str
        .split(/\s+/)
        .map(word => {
            if (!word) return '';
            if (/^[A-Z0-9/&-]{1,6}$/.test(word)) return word;
            const unitMatch = word.match(/^(\d+(?:\.\d+)?)(g|kg|ml|l|lt|ltr|cl|oz|lb|pcs?|pk|m|cm|mm)$/i);
            if (unitMatch) return unitMatch[1] + unitMatch[2].toLowerCase();
            const expanded = word.replace(/(\d+)([A-Za-z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2');
            return expanded.split(/\s+/).map(part =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join(' ');
        })
        .join(' ')
        .replace(/\s+\/\s+/g, ' / ')
        .trim();
}

function normalizeCategoryName(str) {
    if (!str) return '';
    let name = str.trim().replace(/\.+$/, '');
    if (name.includes('/')) {
        return name.split('/').map(part => {
            const cleaned = part.trim().replace(/\.+$/, '');
            return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
        }).join(' / ');
    }
    if (name === name.toUpperCase() || name === name.toLowerCase()) {
        return name.split(/\s+/).map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildProductIndexFromApi(products) {
    ALL_PRODUCTS.length = 0;

    products.forEach(product => {
        if (HIDDEN_CATEGORIES.has(product.categoryName)) return;
        ALL_PRODUCTS.push({
            productId: product.productId,
            categoryId: product.categoryId,
            categoryName: product.categoryName,
            subCategoryId: product.subCategoryId,
            subCategoryName: product.subCategoryName,
            productName: product.productName,
            displayName: product.displayName || formatDisplayName(product.productName),
            weightKG: product.weightKG,
            packType: product.packType || '',
            locationId: 52,
            salesUnitTypeId: 1,
            flaggedCategoryMismatch: false,
            productDescription: product.productDescription || '',
            isFeatured: product.isFeatured === true,
            isBestSeller: product.isBestSeller === true,
            isNewArrival: product.isNewArrival === true,
            isHotOffer: product.isHotOffer === true,
            isExclusive: product.isExclusive === true,
            discountPercent: parseInt(product.discountPercent, 10) || 0,
            kitchenCulture: product.kitchenCulture || null,
        });
    });

    const packSet = new Set();
    const locSet = new Set();

    ALL_PRODUCTS.forEach(p => {
        if (p.packType) packSet.add(p.packType);
        locSet.add(p.locationId);
    });

    uniquePackTypes = ['BAG', 'BOX', 'BUNCH', 'LOOSE', 'PACK'].filter(pt => packSet.has(pt));
    uniqueLocationIds = Array.from(locSet).sort((a, b) => a - b);
    rebuildProductLookup();
}

function buildProductIndex() {
    if (ALL_PRODUCTS.length) return;
}

function rebuildProductLookup() {
    PRODUCT_BY_NAME.clear();
    PRODUCT_BY_DISPLAY.clear();
    PRODUCT_BY_ID.clear();

    ALL_PRODUCTS.forEach(product => {
        PRODUCT_BY_NAME.set(product.productName, product);
        PRODUCT_BY_NAME.set(product.productName.toUpperCase(), product);
        if (product.displayName) {
            PRODUCT_BY_DISPLAY.set(product.displayName, product);
            PRODUCT_BY_DISPLAY.set(product.displayName.toUpperCase(), product);
        }
        if (product.productId != null) {
            PRODUCT_BY_ID.set(product.productId, product);
            PRODUCT_BY_ID.set(String(product.productId), product);
        }
    });
}

function buildImageMaps(byId, products) {
    PRODUCT_IMAGE_BY_ID = { ...(byId || {}) };
    PRODUCT_IMAGE_BY_NAME = {};
    PRODUCT_HOME_IMAGE_BY_ID = { ...(byId || {}) };
    PRODUCT_HOME_IMAGE_BY_NAME = {};
    products.forEach(p => {
        const url = byId[p.productId] || p.primaryImageUrl || '';
        if (url) {
            PRODUCT_IMAGE_BY_ID[p.productId] = url;
            PRODUCT_IMAGE_BY_ID[String(p.productId)] = url;
            PRODUCT_HOME_IMAGE_BY_ID[p.productId] = url;
            PRODUCT_HOME_IMAGE_BY_ID[String(p.productId)] = url;
            PRODUCT_IMAGE_BY_NAME[p.productName] = url;
            PRODUCT_HOME_IMAGE_BY_NAME[p.productName] = url;
        }
    });
}

function buildImageMapsFromProducts(products) {
    const byId = {};
    (products || []).forEach(p => {
        const url = p.primaryImageUrl || '';
        if (!url || p.productId == null) return;
        byId[p.productId] = url;
        byId[String(p.productId)] = url;
    });
    buildImageMaps(byId, products || []);
}

const HIDDEN_CATEGORIES = new Set([
    'oyster', 'lottery', 'vape', 'LOTTERY PAYOUT', 'PAYPOINT'
]);

async function fetchCatalogMetadata() {
    const res = await fetch(`${API_BASE}/api/v1/catalog/metadata`);
    if (!res.ok) throw new Error(`Catalog metadata failed (${res.status})`);
    return res.json();
}

async function fetchCatalogProductsBulk() {
    const res = await fetch(`${API_BASE}/api/v1/catalog/products-bulk`);
    if (!res.ok) throw new Error(`Catalog products failed (${res.status})`);
    return res.json();
}

async function fetchCatalogBootstrap() {
    const res = await fetch(`${API_BASE}/api/v1/catalog/bootstrap`);
    if (!res.ok) throw new Error(`Catalog bootstrap failed (${res.status})`);
    return res.json();
}

function applyCatalogMetadata(data) {
    CATEGORY_STATS = data.categoryStats || [];
    SUBCATEGORY_STATS = data.subcategoryStats || [];
    setPromotionBanners(Array.isArray(data.promotionBanners) ? data.promotionBanners : []);
    if (!PROMOTION_BANNERS.length && Array.isArray(data.promotionBannerImages)) {
        PROMOTION_BANNER_IMAGES = data.promotionBannerImages.filter(Boolean);
    }
    if (data.siteSettings && typeof applySiteSettings === 'function') {
        applySiteSettings(data.siteSettings);
    }
    if (document.body.dataset.page === 'home' && typeof refreshHeroSlider === 'function') {
        refreshHeroSlider();
    }
    document.dispatchEvent(new CustomEvent('gms:metadata-ready'));
}

function finalizeCatalogLoad() {
    _dataReady = true;
    document.dispatchEvent(new CustomEvent('gms:catalog-ready'));
}

function loadCatalogFromSplit(metadata, productsPayload) {
    applyCatalogMetadata(metadata);
    const products = (productsPayload && productsPayload.products) || [];
    buildImageMapsFromProducts(products);
    buildProductIndexFromApi(products);
    finalizeCatalogLoad();
}

function loadCatalogFromBootstrap(data) {
    applyCatalogMetadata(data);
    const products = data.products || [];
    buildImageMaps(data.productImageById || {}, products);
    buildProductIndexFromApi(products);
    finalizeCatalogLoad();
}

async function fetchCatalogSplit() {
    const [metadata, productsPayload] = await Promise.all([
        fetchCatalogMetadata(),
        fetchCatalogProductsBulk(),
    ]);
    return { metadata, productsPayload };
}

function whenCatalogReady() {
    if (_dataReady) return Promise.resolve();
    if (!_dataReadyPromise) {
        _dataReadyPromise = fetchCatalogSplit()
            .then(({ metadata, productsPayload }) => loadCatalogFromSplit(metadata, productsPayload))
            .catch(err => {
                console.warn('Split catalog load failed, falling back to bootstrap:', err);
                return fetchCatalogBootstrap()
                    .then(loadCatalogFromBootstrap)
                    .catch(bootstrapErr => {
                        _dataReadyPromise = null;
                        console.error('Failed to load catalog from API:', bootstrapErr);
                        throw bootstrapErr;
                    });
            });
    }
    return _dataReadyPromise;
}

function getCategoryStats() {
    return CATEGORY_STATS.filter(c => !HIDDEN_CATEGORIES.has(c.CategoryName));
}

function getSubcategoryStats() {
    return SUBCATEGORY_STATS.filter(s => !HIDDEN_CATEGORIES.has(s.CategoryName));
}

function getSubcategoriesForCategory(categoryNameOrId) {
    const stats = getSubcategoryStats();
    if (typeof categoryNameOrId === 'number' || /^[A-Z]{3}\d{2}$/.test(String(categoryNameOrId))) {
        return stats.filter(s => s.ProductCategoryID === categoryNameOrId);
    }
    const upper = String(categoryNameOrId).toUpperCase();
    return stats.filter(s =>
        s.CategoryName.toUpperCase() === upper ||
        normalizeCategoryName(s.CategoryName).toUpperCase() === upper
    );
}

function getTotalProductCount() {
    if (ALL_PRODUCTS.length) return ALL_PRODUCTS.length;
    return getCategoryStats().reduce((sum, cat) => sum + cat.Product_Count, 0);
}

function getFlaggedProducts(flagKey, count) {
    const flagged = ALL_PRODUCTS
        .filter(p => p[flagKey] === true)
        .sort((a, b) => a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' }));
    if (count == null || count <= 0) return flagged;
    return flagged.slice(0, count);
}

function getFeaturedProducts(count) {
    return getFlaggedProducts('isFeatured', count);
}

function getBestSellerProducts(count) {
    return getFlaggedProducts('isBestSeller', count);
}

function getNewArrivalProducts(count) {
    return getFlaggedProducts('isNewArrival', count);
}

function getHotOfferProducts(count) {
    return getFlaggedProducts('isHotOffer', count);
}

function getExclusiveProducts(count) {
    return getFlaggedProducts('isExclusive', count);
}

function resolveStoredProductKey(key) {
    if (key == null) return null;

    if (typeof key === 'object') {
        if (key.productName) {
            const byName = PRODUCT_BY_NAME.get(key.productName)
                || PRODUCT_BY_NAME.get(String(key.productName).toUpperCase());
            if (byName) return byName;
        }
        if (key.productId != null) {
            const byId = PRODUCT_BY_ID.get(key.productId) || PRODUCT_BY_ID.get(String(key.productId));
            if (byId) return byId;
        }
        if (key.displayName) {
            const byDisplay = PRODUCT_BY_DISPLAY.get(key.displayName)
                || PRODUCT_BY_DISPLAY.get(String(key.displayName).toUpperCase());
            if (byDisplay) return byDisplay;
        }
        return null;
    }

    const str = String(key).trim();
    if (!str) return null;

    let product = PRODUCT_BY_NAME.get(str) || PRODUCT_BY_NAME.get(str.toUpperCase());
    if (product) return product;

    product = PRODUCT_BY_DISPLAY.get(str) || PRODUCT_BY_DISPLAY.get(str.toUpperCase());
    if (product) return product;

    product = PRODUCT_BY_ID.get(str);
    if (product) return product;

    return null;
}

function findCategoryByParam(param) {
    if (!param) return null;
    const stats = getCategoryStats();
    if (/^[A-Z]{3}\d{2}$/.test(param)) {
        return stats.find(c => c.ProductCategoryID === param) || null;
    }
    const asNum = parseInt(param, 10);
    if (!isNaN(asNum)) {
        return stats.find(c => c.ProductCategoryID === asNum) || null;
    }
    return stats.find(c =>
        c.CategoryName.toUpperCase() === param.toUpperCase() ||
        normalizeCategoryName(c.CategoryName).toUpperCase() === param.toUpperCase()
    ) || null;
}

function findSubcategoryByParam(param) {
    if (!param) return null;
    const stats = getSubcategoryStats();
    if (param.includes('-')) {
        return stats.find(s => s.ProductSubCategoryID === param) || null;
    }
    const asNum = parseInt(param, 10);
    if (!isNaN(asNum)) {
        return stats.find(s => s.ProductSubCategoryID === asNum) || null;
    }
    return stats.find(s =>
        s.SubCategoryName.toUpperCase() === param.toUpperCase() ||
        normalizeCategoryName(s.SubCategoryName).toUpperCase() === param.toUpperCase()
    ) || null;
}

