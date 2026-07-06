/* IMAGE CONFIG — drop real image URLs here when available
   Format: PRODUCT_IMAGE_MAP['EXACT PRODUCT NAME'] = '/path/to/image.jpg'; */
const PRODUCT_IMAGE_MAP = {
    'KNORR AROMAT SEAS AL 90G': 'https://res.cloudinary.com/dgsnwhyah/image/upload/v1782933746/gms-world-foods/images/products/knorr-aromat-all-purpose-seasoning-90g.png'
};

/* ── Category thumbnail images for top-categories carousel ─────────────────── */
const CATEGORY_IMAGE_MAP = {
    'Dry grocery & staples':          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170663/gms-world-foods/categories/dry-grocery-staples.png',
    'Snacks & confectionery':         'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170666/gms-world-foods/categories/snacks-confectionery.png',
    'Beverages':                      'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170669/gms-world-foods/categories/beverages.png',
    'Fresh produce':                  'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170671/gms-world-foods/categories/fresh-produce.png',
    'Frozen, meat & ready-to-cook':   'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170673/gms-world-foods/categories/frozen-meat-ready-to-cook.png',
    'Condiments, sauces & pickles':   'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170675/gms-world-foods/categories/condiments-sauces-pickles.png',
    'Dairy, eggs & chilled':          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170677/gms-world-foods/categories/dairy-eggs-chilled.png',
    'Household & personal care':      'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170680/gms-world-foods/categories/household-personal-care.png',
    'Bakery, pasta & noodles':        'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170681/gms-world-foods/categories/bakery-pasta-noodles.png',
    DEFAULT:                          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170663/gms-world-foods/categories/dry-grocery-staples.png'
};

const CATEGORY_BANNER_IMAGE_MAP = {
    'Dry grocery & staples':          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170663/gms-world-foods/categories/dry-grocery-staples.png',
    'Snacks & confectionery':         'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170666/gms-world-foods/categories/snacks-confectionery.png',
    'Beverages':                      'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170669/gms-world-foods/categories/beverages.png',
    'Fresh produce':                  'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170671/gms-world-foods/categories/fresh-produce.png',
    'Frozen, meat & ready-to-cook':   'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170673/gms-world-foods/categories/frozen-meat-ready-to-cook.png',
    'Condiments, sauces & pickles':   'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170675/gms-world-foods/categories/condiments-sauces-pickles.png',
    'Dairy, eggs & chilled':          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170677/gms-world-foods/categories/dairy-eggs-chilled.png',
    'Household & personal care':      'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170680/gms-world-foods/categories/household-personal-care.png',
    'Bakery, pasta & noodles':        'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170681/gms-world-foods/categories/bakery-pasta-noodles.png',
    DEFAULT:                          'https://res.cloudinary.com/dgsnwhyah/image/upload/v1783170663/gms-world-foods/categories/dry-grocery-staples.png'
};

/* Category photo pools for product cards when no real pack image is available */
const CATEGORY_PRODUCT_PLACEHOLDER_MAP = {
    'Dry grocery & staples': [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596040033229-a0b451c4f3fe?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608797178974-15b8a8f3c0ba?w=400&h=400&fit=crop&q=80'
    ],
    'Snacks & confectionery': [
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558961363-fa8ccf64a658?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop&q=80'
    ],
    'Beverages': [
        'https://images.unsplash.com/photo-1625772299848-391b6a87bb7b?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop&q=80'
    ],
    'Fresh produce': [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610839437126-9e23df6c2c34?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566385101042-f3661c0d6b0f?w=400&h=400&fit=crop&q=80'
    ],
    'Frozen, meat & ready-to-cook': [
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=400&fit=crop&q=80'
    ],
    'Condiments, sauces & pickles': [
        'https://images.unsplash.com/photo-1472476446867-f7eabba9f4c5?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628088062854-b18724b8e8d3?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596040033229-a0b451c4f3fe?w=400&h=400&fit=crop&q=80'
    ],
    'Dairy, eggs & chilled': [
        'https://images.unsplash.com/photo-1628088062854-b18724b8e8d3?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550583724-b2692b85b782?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&q=80'
    ],
    'Household & personal care': [
        'https://images.unsplash.com/photo-1585421514284-efb74c2b69bb?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563453394711-d3278afff153?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600855894207-791daff08e8d?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&q=80'
    ],
    'Bakery, pasta & noodles': [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551183053-bf57a1b51416?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1473093290773-550a8b6e8548?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1604908176997-4317c4d1f0f0?w=400&h=400&fit=crop&q=80'
    ],
    DEFAULT: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607083206869-4c7672f72d8a?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop&q=80'
    ]
};

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&q=80';

/* ── Category colour + icon config (9 real categories) ─────────────────────── */
const CATEGORY_PLACEHOLDER_CONFIG = {
    'Dry grocery & staples':          { color: '#185FA5', icon: 'fa-wheat-awn' },
    'Snacks & confectionery':         { color: '#D85A30', icon: 'fa-cookie-bite' },
    'Beverages':                      { color: '#1D9E75', icon: 'fa-bottle-water' },
    'Fresh produce':                  { color: '#3B6D11', icon: 'fa-leaf' },
    'Frozen, meat & ready-to-cook':   { color: '#534AB7', icon: 'fa-snowflake' },
    'Condiments, sauces & pickles':   { color: '#BA7517', icon: 'fa-jar' },
    'Dairy, eggs & chilled':          { color: '#0891B2', icon: 'fa-cheese' },
    'Household & personal care':      { color: '#993556', icon: 'fa-pump-soap' },
    'Bakery, pasta & noodles':        { color: '#5F5E5A', icon: 'fa-bread-slice' },
    DEFAULT:                          { color: '#475569', icon: 'fa-tag' }
};

function getCategoryKey(categoryName) {
    if (!categoryName) return 'DEFAULT';
    if (CATEGORY_PLACEHOLDER_CONFIG[categoryName]) return categoryName;
    // Case-insensitive fallback
    const lower = categoryName.toLowerCase();
    for (const key of Object.keys(CATEGORY_PLACEHOLDER_CONFIG)) {
        if (key.toLowerCase() === lower) return key;
    }
    return 'DEFAULT';
}

function categoryStatForName(categoryName) {
    if (typeof getCategoryStats !== 'function') return null;
    const key = getCategoryKey(categoryName);
    return getCategoryStats().find(s => getCategoryKey(s.CategoryName) === key) || null;
}

function getCategoryImage(categoryName) {
    const stat = categoryStatForName(categoryName);
    if (stat && stat.IconImageUrl) return stat.IconImageUrl;
    const key = getCategoryKey(categoryName);
    return CATEGORY_IMAGE_MAP[key] || CATEGORY_IMAGE_MAP.DEFAULT;
}

function getCategoryBannerImage(categoryName) {
    const stat = categoryStatForName(categoryName);
    if (stat && stat.BannerImageUrl) return stat.BannerImageUrl;
    const key = getCategoryKey(categoryName);
    return CATEGORY_BANNER_IMAGE_MAP[key] || CATEGORY_BANNER_IMAGE_MAP.DEFAULT;
}

function renderCategoryCardImageHTML(categoryName) {
    const name = typeof normalizeCategoryName === 'function'
        ? normalizeCategoryName(categoryName)
        : categoryName;
    const src = getCategoryImage(categoryName);
    const ph = getCategoryPlaceholder(categoryName);
    return `<img src="${src}" alt="${name}" class="top-cat-card-img" loading="lazy" decoding="async"
        onerror="this.onerror=null;this.classList.add('top-cat-card-img--hidden');this.insertAdjacentHTML('afterend','<i class=\\'fa-solid ${ph.icon} top-cat-card-fallback-icon\\' aria-hidden=\\'true\\'></i>');this.parentElement.style.background='${ph.gradient}';this.parentElement.classList.add('top-cat-card-image--fallback');">`;
}

function getCategoryPlaceholder(categoryName) {
    const key = getCategoryKey(categoryName);
    const config = CATEGORY_PLACEHOLDER_CONFIG[key] || CATEGORY_PLACEHOLDER_CONFIG.DEFAULT;
    const baseColor = config.color;
    const darker = adjustColor(baseColor, -30);
    return {
        color: baseColor,
        icon: config.icon,
        gradient: `linear-gradient(135deg, ${baseColor} 0%, ${darker} 100%)`
    };
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getProductInitials(productName) {
    if (!productName) return '';
    const words = productName.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return productName.slice(0, 2).toUpperCase();
}

function hashProductSeed(value) {
    const str = String(value || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getProductPlaceholderImage(product) {
    const type = detectProductImageType(product);
    const pool = PRODUCT_TYPE_PLACEHOLDER_MAP[type] || PRODUCT_TYPE_PLACEHOLDER_MAP.default;
    const seed = hashProductSeed(product.productName || product.productId);
    return pool[seed % pool.length];
}

function detectProductImageType(product) {
    const name = (product.productName || '').toUpperCase();
    const sub = (product.subCategoryName || '').toLowerCase();
    const cat = (product.categoryName || '').toLowerCase();

    if (/\bGHEE\b/.test(name)) return 'ghee';
    if (/\bJASMINE\b/.test(name)) return 'rice_jasmine';
    if (/\bBASMATI\b|\bBASMTI\b|\bBAS\b/.test(name) || (/\bRICE\b/.test(name) && sub.includes('rice'))) return 'rice_basmati';
    if (/\bRICE\b/.test(name) || sub.includes('rice')) return 'rice_other';
    if (/\bOLIVE\b|\bPOMACE\b/.test(name) || (/\bOIL\b/.test(name) && sub.includes('oil'))) return 'cooking_oil';
    if (/\bPISTA\b|\bALMOND\b|\bCASHEW\b|\bNUT/.test(name) || sub.includes('nut')) return 'nuts';
    if (/\bATTA\b|\bFLOUR\b|\bMULTIGRAN\b/.test(name) || sub.includes('atta') || sub.includes('flour')) return 'atta_flour';
    if (/\bMACE\b|\bSPICE\b|\bMASALA\b|\bCUMIN\b|\bTURMERIC\b/.test(name) || sub.includes('spice')) return 'spices';
    if (sub.includes('snack') || sub.includes('namkeen') || cat.includes('confection')) return 'snacks';
    if (cat.includes('dairy') || sub.includes('cheese')) return 'dairy';
    if (cat.includes('beverage')) return 'beverages';
    if (cat.includes('fresh produce')) return 'fresh_produce';
    if (cat.includes('frozen') || sub.includes('meat')) return 'frozen_meat';
    if (cat.includes('condiment') || sub.includes('pickle') || sub.includes('sauce')) return 'condiments';
    if (cat.includes('household')) return 'household';
    if (cat.includes('bakery') || sub.includes('pasta') || sub.includes('noodle')) return 'bakery';
    return getCategoryKey(product.categoryName);
}

const PRODUCT_TYPE_PLACEHOLDER_MAP = {
    rice_basmati: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Dry grocery & staples'],
    rice_jasmine: [
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304997881-2f2b746c0ce7?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop&q=80'
    ],
    rice_other: [
        'https://images.unsplash.com/photo-1586201375780-22159a86590e?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601050690117-94f1554d6df0?w=400&h=400&fit=crop&q=80'
    ],
    cooking_oil: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628556294753-0ca3de75b73f?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1609501676725-7186207b7b63?w=400&h=400&fit=crop&q=80'
    ],
    ghee: [
        'https://images.unsplash.com/photo-1589983890515-2411a3fd8d8e?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550583724-b2692b85b782?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1628088062854-b18724b8e8d3?w=400&h=400&fit=crop&q=80'
    ],
    spices: [
        'https://images.unsplash.com/photo-1596040033229-a0b451c4f3fe?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506368249637-73bd05e2f7fc?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop&q=80'
    ],
    nuts: [
        'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599599810769-bcde5a16007e?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop&q=80'
    ],
    atta_flour: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608797178974-15b8a8f3c0ba?w=400&h=400&fit=crop&q=80'
    ],
    snacks: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Snacks & confectionery'],
    dairy: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Dairy, eggs & chilled'],
    beverages: CATEGORY_PRODUCT_PLACEHOLDER_MAP.Beverages,
    fresh_produce: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Fresh produce'],
    frozen_meat: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Frozen, meat & ready-to-cook'],
    condiments: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Condiments, sauces & pickles'],
    household: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Household & personal care'],
    bakery: CATEGORY_PRODUCT_PLACEHOLDER_MAP['Bakery, pasta & noodles'],
    default: CATEGORY_PRODUCT_PLACEHOLDER_MAP.DEFAULT,
    'Dry grocery & staples': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Dry grocery & staples'],
    'Snacks & confectionery': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Snacks & confectionery'],
    Beverages: CATEGORY_PRODUCT_PLACEHOLDER_MAP.Beverages,
    'Fresh produce': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Fresh produce'],
    'Frozen, meat & ready-to-cook': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Frozen, meat & ready-to-cook'],
    'Condiments, sauces & pickles': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Condiments, sauces & pickles'],
    'Dairy, eggs & chilled': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Dairy, eggs & chilled'],
    'Household & personal care': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Household & personal care'],
    'Bakery, pasta & noodles': CATEGORY_PRODUCT_PLACEHOLDER_MAP['Bakery, pasta & noodles']
};

function resolveProductImageUrl(product) {
    let imageUrl = null;
    if (typeof PRODUCT_IMAGE_BY_ID !== 'undefined' && product.productId != null) {
        imageUrl = PRODUCT_IMAGE_BY_ID[product.productId] || PRODUCT_IMAGE_BY_ID[String(product.productId)];
    }
    if (!imageUrl && typeof PRODUCT_IMAGE_BY_NAME !== 'undefined') {
        imageUrl = PRODUCT_IMAGE_BY_NAME[product.productName];
    }
    if (!imageUrl) {
        imageUrl = PRODUCT_IMAGE_MAP[product.productName];
    }
    if (!imageUrl && typeof PRODUCT_HOME_IMAGE_BY_ID !== 'undefined' && product.productId != null) {
        imageUrl = PRODUCT_HOME_IMAGE_BY_ID[product.productId] || PRODUCT_HOME_IMAGE_BY_ID[String(product.productId)];
    }
    if (!imageUrl && typeof PRODUCT_HOME_IMAGE_BY_NAME !== 'undefined') {
        imageUrl = PRODUCT_HOME_IMAGE_BY_NAME[product.productName];
    }
    return imageUrl || null;
}

function escapeHtmlAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;');
}

function renderPlaceholderHTML(categoryName, productName, sizeClass) {
    const placeholder = getCategoryPlaceholder(categoryName);
    const initials = getProductInitials(productName);
    const iconSize = sizeClass === 'large' ? '64px' : sizeClass === 'small' ? '32px' : '48px';
    return `
        <div class="product-placeholder ${sizeClass || ''}" style="background: ${placeholder.gradient}" aria-hidden="true">
            <i class="fa-solid ${placeholder.icon}" style="font-size: ${iconSize}"></i>
            <span class="placeholder-initials">${initials}</span>
        </div>
    `;
}

function renderProductImageArea(product, sizeClass) {
    const primaryUrl = resolveProductImageUrl(product);
    const categoryPlaceholder = getProductPlaceholderImage(product);
    const src = primaryUrl || categoryPlaceholder;
    const cls = `product-image ${sizeClass || ''}`.trim();
    const alt = escapeHtmlAttr(product.displayName || product.productName);
    const fallbackAttr = primaryUrl
        ? ` data-fallback-src="${escapeHtmlAttr(categoryPlaceholder)}"`
        : '';
    const iconFallbackAttr = ` data-icon-fallback="1" data-category="${escapeHtmlAttr(product.categoryName)}" data-name="${escapeHtmlAttr(product.productName)}" data-size="${escapeHtmlAttr(sizeClass || '')}"`;

    return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" class="${cls}" loading="lazy" decoding="async"${fallbackAttr}${iconFallbackAttr}
        onerror="window.__gmsProductImgError && window.__gmsProductImgError(this)">`;
}

function handleProductImageError(img) {
    if (!img) return;
    if (img.dataset.fallbackSrc && !img.dataset.usedFallback) {
        img.dataset.usedFallback = '1';
        img.src = img.dataset.fallbackSrc;
        return;
    }
    if (img.dataset.iconFallback && typeof renderPlaceholderHTML === 'function') {
        img.onerror = null;
        const html = renderPlaceholderHTML(
            img.dataset.category,
            img.dataset.name,
            img.dataset.size
        );
        if (html) img.outerHTML = html;
        return;
    }
    img.onerror = null;
    img.src = PRODUCT_IMAGE_FALLBACK;
}

window.__gmsProductImgError = handleProductImageError;
