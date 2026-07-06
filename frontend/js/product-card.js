/* Shared featured-style product card (fp-card) used across the site */

/** Stable numeric seed from product id (ids are strings like "DRY001", not numbers). */
function productCardSeed(product, index) {
    const raw = product && product.productId;
    if (raw != null && raw !== '') {
        const digits = parseInt(String(raw).replace(/\D/g, ''), 10);
        if (!Number.isNaN(digits) && digits > 0) return digits;
        let h = 0;
        for (const ch of String(raw)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        return h || (Number(index) || 0) + 1;
    }
    return (Number(index) || 0) * 3 + 1;
}

function getProductCardReviewCount(product, index, offset = 0) {
    const seed = productCardSeed(product, Number(index) || 0);
    const off  = Number(offset) || 0;
    const count = 8 + ((seed + off * 5) % 35);
    return Number.isFinite(count) ? count : 12;
}

function buildDiscountBadgeHTML(discountPct, extraClass = '') {
    const pct = parseInt(discountPct, 10) || 0;
    if (pct <= 0) return '';
    const cls = extraClass ? `discount-circle ${extraClass}` : 'discount-circle';
    return `
        <div class="${cls}" aria-label="${pct} percent off">
            <div class="percent">-${pct}%</div>
            <div class="discount-text">discount</div>
        </div>`;
}

function buildProductCardBottomHTML(product, inBasket, basketQty) {
    const name = product.displayName || product.productName;
    if (!inBasket) {
        return `
            <div class="fp-bottom">
                <button type="button" class="fp-add-btn" aria-label="Add ${name} to basket">
                    <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i> Add
                </button>
            </div>
        `;
    }
    return `
        <div class="fp-bottom fp-bottom--has-item">
            <button type="button" class="fp-add-btn fp-add-btn--in-cart"
                aria-label="${name} — ${basketQty} in basket, click to add another">
                <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i> ${basketQty}
            </button>
            <button type="button" class="fp-remove-btn" aria-label="Remove ${name} from basket">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
        </div>
    `;
}

function buildProductCardHTML(product, index, discountOffset = 0, options = {}) {
    const reviews = getProductCardReviewCount(product, index, discountOffset);
    const category = normalizeCategoryName(product.subCategoryName || product.categoryName);
    const inBasket = typeof GmsShoppingStore !== 'undefined' && GmsShoppingStore.isInCart(product.productName);
    const basketQty  = inBasket && typeof GmsShoppingStore !== 'undefined'
        ? GmsShoppingStore.getCartQty(product.productName) : 0;
    const discountPct = parseInt(product.discountPercent, 10) || 0;
    const discountBadge = buildDiscountBadgeHTML(discountPct);

    return `
        <article class="fp-card" data-product-name="${product.productName}">
            <div class="fp-image-area">
                <div class="fp-image-frame">
                    ${discountBadge}
                    ${renderProductImageArea(product, 'fp')}
                </div>
            </div>
            <div class="fp-content">
                <div class="fp-category">${category}</div>
                <h3 class="fp-title">${product.displayName}</h3>
                <div class="fp-rating" aria-label="5 out of 5 stars">
                    <span class="fp-stars">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                    </span>
                    <span class="fp-review">(${reviews})</span>
                </div>
                <div class="fp-body-spacer" aria-hidden="true"></div>
                ${buildProductCardBottomHTML(product, inBasket, basketQty)}
            </div>
        </article>
    `;
}

function bindProductCards(container, options = {}) {
    if (!container) return;

    container._fpCardOptions = options;

    if (!container.dataset.fpCardsBound) {
        container.dataset.fpCardsBound = '1';

        container.addEventListener('click', (e) => {
            const card = e.target.closest('.fp-card');
            if (!card || !container.contains(card)) return;

            const product = ALL_PRODUCTS.find(p => p.productName === card.dataset.productName);
            if (!product) return;

            const opts = container._fpCardOptions || {};
            const openDetails = (trigger) => {
                if (typeof opts.onOpen === 'function') opts.onOpen(product, trigger);
                if (typeof addToRecentlyViewed === 'function') addToRecentlyViewed(product);
                if (typeof openProductModal === 'function') openProductModal(product);
            };

            if (e.target.closest('.fp-remove-btn')) {
                e.stopPropagation();
                if (typeof removeFromCart === 'function') removeFromCart(product.productName);
                if (typeof updateProductCardBasketState === 'function') {
                    updateProductCardBasketState(product.productName, card);
                }
                return;
            }

            if (e.target.closest('.fp-add-btn')) {
                e.stopPropagation();
                if (typeof addToCart === 'function') addToCart(product.productName, 1);
                if (typeof opts.onAddToCart === 'function') opts.onAddToCart(product);
                if (typeof addToRecentlyViewed === 'function') addToRecentlyViewed(product);
                if (typeof updateProductCardBasketState === 'function') {
                    updateProductCardBasketState(product.productName, card);
                }
                return;
            }

            openDetails(card);
        });

        container.addEventListener('keydown', (e) => {
            const card = e.target.closest('.fp-card');
            if (!card || !container.contains(card)) return;
            if (e.target.closest('.fp-add-btn') || e.target.closest('.fp-remove-btn')) return;

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const product = ALL_PRODUCTS.find(p => p.productName === card.dataset.productName);
                if (!product) return;
                const opts = container._fpCardOptions || {};
                if (typeof opts.onOpen === 'function') opts.onOpen(product, card);
                if (typeof addToRecentlyViewed === 'function') addToRecentlyViewed(product);
                if (typeof openProductModal === 'function') openProductModal(product);
            }
        });
    }

    container.querySelectorAll('.fp-card').forEach(card => {
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
    });
}
