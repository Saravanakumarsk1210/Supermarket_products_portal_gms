/* ============================================================
   GMS BASKET — Page rendering, helpers, and WhatsApp ordering
   State is owned by GmsShoppingStore (shopping-store.js).
   ============================================================ */

const GMS_WHATSAPP_NUMBER = '441895476737';
const BASKET_COUPON_KEY = 'gms_applied_coupon_v1';

let activeCouponsMap = {};
let couponFetchPromise = null;

function resolveWhatsAppNumber() {
    return typeof getWhatsAppNumber === 'function' ? getWhatsAppNumber() : GMS_WHATSAPP_NUMBER;
}

function getCartMap() {
    return typeof GmsShoppingStore !== 'undefined'
        ? GmsShoppingStore.getCartMapObject()
        : {};
}

function getCartLineItems() {
    const map = getCartMap();
    return Object.entries(map)
        .map(([productName, quantity]) => {
            const product = typeof resolveStoredProductKey === 'function'
                ? resolveStoredProductKey(productName)
                : (typeof ALL_PRODUCTS !== 'undefined'
                    ? ALL_PRODUCTS.find(p => p.productName === productName)
                    : null);
            if (!product) return null;
            return { product, quantity: Math.max(1, quantity) };
        })
        .filter(Boolean);
}

function getCartCount() {
    return typeof GmsShoppingStore !== 'undefined'
        ? GmsShoppingStore.getCartCount()
        : 0;
}

function normalizeCartInStorage() {
    if (typeof GmsShoppingStore !== 'undefined') GmsShoppingStore.hydrate(true);
    return getCartMap();
}

function addToCart(productName, quantity) {
    if (typeof GmsShoppingStore === 'undefined') return;
    const qty     = Math.max(1, parseInt(quantity, 10) || 1);
    const product = GmsShoppingStore.addToCartStore(productName, qty);
    if (typeof updateHeaderBadges === 'function') updateHeaderBadges();
    if (typeof updateProductCardBasketState === 'function') updateProductCardBasketState(productName);
    document.dispatchEvent(new CustomEvent('gms:basket-updated'));
    if (product) {
        showToast(`${product.displayName} added to your basket.`, 'basket');
    }
}

function setCartQuantity(productName, quantity) {
    if (typeof GmsShoppingStore !== 'undefined') {
        GmsShoppingStore.setCartQuantityStore(productName, quantity);
    }
    if (typeof updateHeaderBadges === 'function') updateHeaderBadges();
    if (typeof updateProductCardBasketState === 'function') updateProductCardBasketState(productName);
    document.dispatchEvent(new CustomEvent('gms:basket-updated'));
}

function removeFromCart(productName) {
    if (typeof GmsShoppingStore !== 'undefined') {
        GmsShoppingStore.removeFromCartStore(productName);
    }
    if (typeof updateHeaderBadges === 'function') updateHeaderBadges();
    if (typeof updateProductCardBasketState === 'function') updateProductCardBasketState(productName);
    document.dispatchEvent(new CustomEvent('gms:basket-updated'));
    showToast('Item removed from your basket.', 'remove');
}

function clearCart() {
    if (typeof GmsShoppingStore !== 'undefined') GmsShoppingStore.clearCartStore();
    if (typeof updateHeaderBadges === 'function') updateHeaderBadges();
    document.dispatchEvent(new CustomEvent('gms:basket-updated'));
    showToast('Basket cleared', 'remove');
}

function showToast(message, type) {
    let container = document.getElementById('gms-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'gms-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `gms-toast gms-toast--${type || 'info'}`;
    toast.setAttribute('role', 'status');
    const safeMsg = escStr(message);
    toast.innerHTML = `
        <span class="gms-toast__icon" aria-hidden="true">
            <i class="fa-regular fa-circle-check"></i>
        </span>
        <span class="gms-toast__msg">${safeMsg}</span>
        <button type="button" class="gms-toast__close" aria-label="Dismiss notification">×</button>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('gms-toast--visible'));
    });

    const dismiss = () => {
        toast.classList.remove('gms-toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };
    const timer = setTimeout(dismiss, 3500);
    toast.querySelector('.gms-toast__close').addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        dismiss();
    });
}

function getRecommendations(excludeNames, count) {
    if (typeof ALL_PRODUCTS === 'undefined') return [];
    const exclude = new Set(excludeNames);
    return ALL_PRODUCTS.filter(p => !exclude.has(p.productName)).slice(0, count || 6);
}

async function loadActiveCoupons() {
    if (!couponFetchPromise) {
        couponFetchPromise = fetch('/api/v1/coupons/active')
            .then(res => (res.ok ? res.json() : {}))
            .catch(() => ({}))
            .then(data => {
                activeCouponsMap = data && typeof data === 'object' ? data : {};
                return activeCouponsMap;
            })
            .finally(() => {
                couponFetchPromise = null;
            });
    }
    return couponFetchPromise;
}

function getStoredCouponCode() {
    try {
        return (sessionStorage.getItem(BASKET_COUPON_KEY) || '').trim().toUpperCase();
    } catch (_) {
        return '';
    }
}

function setStoredCouponCode(code) {
    try {
        const normalized = (code || '').trim().toUpperCase();
        if (normalized) sessionStorage.setItem(BASKET_COUPON_KEY, normalized);
        else sessionStorage.removeItem(BASKET_COUPON_KEY);
    } catch (_) {}
}

function resolveAppliedCoupon() {
    const code = getStoredCouponCode();
    if (!code) return null;
    const coupon = activeCouponsMap[code];
    if (!coupon) return null;
    return { code, ...coupon };
}

function syncStoredCouponWithApi() {
    const code = getStoredCouponCode();
    if (code && !activeCouponsMap[code]) {
        setStoredCouponCode('');
    }
}

function formatCouponDiscountLabel(coupon) {
    if (!coupon) return '';
    if (coupon.type === 'fixed') {
        return `£${Number(coupon.value || 0).toFixed(2)} off`;
    }
    return `${parseInt(coupon.value, 10) || 0}% discount`;
}

function buildCouponAppliedLine(coupon) {
    if (!coupon) return '';
    return `Promo coupon applied: ${coupon.code} (${formatCouponDiscountLabel(coupon)} on my order)`;
}

function buildOrderMessageText(lines, coupon) {
    const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);
    const itemWord = totalUnits === 1 ? 'item' : 'items';
    let message = `Hello GMS World Foods,\n\nI would like to place an order for the following ${totalUnits} ${itemWord}:\n\n`;
    message += lines.map(l => `• ${l.product.displayName} × ${l.quantity}`).join('\n');
    message += '\n\n';
    if (coupon) {
        message += `${buildCouponAppliedLine(coupon)}\n\n`;
    }
    message += 'Could you please confirm whether these items are currently available?\n\nThank you. I look forward to your response.';
    return message;
}

function buildOrderMessagePreviewHTML(lines, coupon) {
    const text = buildOrderMessageText(lines, coupon);
    let html = escStr(text);
    if (coupon) {
        const couponLine = buildCouponAppliedLine(coupon);
        const escapedLine = escStr(couponLine);
        html = html.replace(
            escapedLine,
            `<strong class="order-message-preview-coupon">${escapedLine}</strong>`
        );
    }
    return html;
}

function buildWhatsAppOrderUrl(lines, coupon) {
    const message = buildOrderMessageText(lines, coupon);
    return `https://wa.me/${resolveWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}

function buildBasketImageHTML(product) {
    if (typeof renderProductImageArea === 'function') {
        return `<div class="cart-line-image">${renderProductImageArea(product, 'cart-thumb')}</div>`;
    }
    return '<div class="cart-line-image cart-line-image--placeholder"></div>';
}

function buildBasketLineHTML(line) {
    const { product, quantity } = line;
    const category = product.subCategoryName || product.categoryName || '';
    const skuCode  = 'GMS-' + String(product.productId || '').padStart(5, '0');

    return `
        <article class="cart-line" data-product-name="${escStr(product.productName)}">
            ${buildBasketImageHTML(product)}
            <div class="cart-line-details">
                <div class="cart-line-category">${escStr(category)}</div>
                <h2 class="cart-line-name">${escStr(product.displayName)}</h2>
                <div class="cart-line-meta">
                    <span class="cart-line-sku">SKU: ${escStr(skuCode)}</span>
                    ${product.packType ? `<span class="cart-line-pack">${escStr(product.packType)}</span>` : ''}
                </div>
                <div class="cart-line-availability cart-line-availability--in">
                    <i class="fa-solid fa-circle-check" aria-hidden="true"></i> Available — enquire for details
                </div>
            </div>
            <div class="cart-line-actions">
                <div class="qty-control" role="group" aria-label="Quantity for ${escStr(product.displayName)}">
                    <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
                    <span class="qty-value" aria-live="polite">${quantity}</span>
                    <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="cart-line-remove"
                    aria-label="Remove ${escStr(product.displayName)} from basket">
                    <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
                </button>
            </div>
        </article>
    `;
}

function buildCouponSectionHTML(appliedCoupon, couponError) {
    if (appliedCoupon) {
        return `
            <div class="coupon-section" id="coupon-section">
                <div class="coupon-applied">
                    <i class="fa-solid fa-ticket" aria-hidden="true"></i>
                    <span><strong>${escStr(appliedCoupon.code)}</strong> — ${escStr(formatCouponDiscountLabel(appliedCoupon))} applied</span>
                    <button type="button" class="coupon-remove-btn" id="coupon-remove-btn" aria-label="Remove coupon">×</button>
                </div>
            </div>
        `;
    }

    const bodyHidden = couponError ? '' : ' hidden';
    const expanded = couponError ? 'true' : 'false';

    return `
        <div class="coupon-section" id="coupon-section">
            <button type="button" class="coupon-promo-link" id="coupon-promo-toggle"
                aria-expanded="${expanded}" aria-controls="coupon-section-body">
                Do You have Promo code ?
            </button>
            <div class="coupon-section-body${bodyHidden}" id="coupon-section-body">
                <div class="coupon-input-row">
                    <input type="text" class="coupon-input" id="coupon-code-input"
                        placeholder="Enter coupon code" autocomplete="off"
                        autocapitalize="characters" spellcheck="false"
                        value="${escStr(getStoredCouponCode())}">
                    <button type="button" class="btn btn-outline coupon-apply-btn" id="coupon-apply-btn">Apply</button>
                </div>
                ${couponError ? `<p class="coupon-error" id="coupon-error">${escStr(couponError)}</p>` : '<p class="coupon-error hidden" id="coupon-error"></p>'}
            </div>
        </div>
    `;
}

function buildOrderSummaryRowsHTML(lines, appliedCoupon) {
    const lineCount = lines.length;
    const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);
    const discountRow = appliedCoupon ? `
        <div class="order-summary-row order-summary-row--discount">
            <span>Coupon <strong>${escStr(appliedCoupon.code)}</strong></span>
            <span class="order-summary-discount">${escStr(formatCouponDiscountLabel(appliedCoupon))}</span>
        </div>
    ` : '';

    return `
        <div class="order-summary-rows">
            <div class="order-summary-row">
                <span>Products</span>
                <span>${lineCount} product${lineCount === 1 ? '' : 's'}</span>
            </div>
            <div class="order-summary-row">
                <span>Total units</span>
                <span>${totalUnits}</span>
            </div>
            ${discountRow}
            <div class="order-summary-row order-summary-row--total">
                <span>Order summary</span>
                <span>${totalUnits} item${totalUnits === 1 ? '' : 's'} ready to send</span>
            </div>
        </div>
    `;
}

function buildBasketSummaryHTML(lines, appliedCoupon, couponError) {
    const previewMessage = buildOrderMessagePreviewHTML(lines, appliedCoupon);

    return `
        <aside class="order-summary" aria-label="Basket summary">
            <h2 class="order-summary-title">Your Basket</h2>
            ${buildOrderSummaryRowsHTML(lines, appliedCoupon)}
            ${buildCouponSectionHTML(appliedCoupon, couponError)}
            <div class="order-message-preview-wrap">
                <h3 class="order-message-preview-heading">Your WhatsApp message</h3>
                <p class="order-message-preview-sub">Could you please confirm whether these items are currently available?</p>
                <div class="order-message-preview" id="order-message-preview" aria-live="polite">${previewMessage}</div>
            </div>
            <a href="#" class="btn btn-primary btn-checkout btn-full" id="whatsapp-order-btn" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Order quickly on WhatsApp
            </a>
            <p class="order-summary-note">
                Or message us directly at
                <a href="https://wa.me/${resolveWhatsAppNumber()}" target="_blank" rel="noopener noreferrer" style="color:var(--green);font-weight:600">WhatsApp</a>
                · Visit us at 88–90 High St, West Drayton
            </p>
            <a href="products.html" class="order-continue-link">← Continue browsing</a>
        </aside>
    `;
}

function updateOrderMessagePreview(container, lines, coupon) {
    const previewEl = container.querySelector('#order-message-preview');
    if (!previewEl) return;
    previewEl.innerHTML = buildOrderMessagePreviewHTML(lines, coupon);
}

function showConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirm-modal-overlay');
        const titleEl = document.getElementById('confirm-dialog-title');
        const messageEl = document.getElementById('confirm-dialog-message');
        const okBtn = document.getElementById('confirm-dialog-ok');
        const cancelBtn = document.getElementById('confirm-dialog-cancel');
        const closeBtn = document.getElementById('confirm-dialog-close');
        if (!overlay || !titleEl || !messageEl || !okBtn || !cancelBtn) {
            resolve(false);
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        okBtn.textContent = confirmLabel;
        cancelBtn.textContent = cancelLabel;

        const close = (result) => {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            closeBtn?.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onOverlayClick);
            document.removeEventListener('keydown', onKeydown);
            resolve(result);
        };

        const onOk = () => close(true);
        const onCancel = () => close(false);
        const onOverlayClick = (e) => {
            if (e.target === overlay) close(false);
        };
        const onKeydown = (e) => {
            if (e.key === 'Escape') close(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        closeBtn?.addEventListener('click', onCancel);
        overlay.addEventListener('click', onOverlayClick);
        document.addEventListener('keydown', onKeydown);

        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        cancelBtn.focus();
    });
}

function renderBasketPage(couponError) {
    const root = document.getElementById('basket-page-root');
    if (!root) return;

    syncStoredCouponWithApi();
    const appliedCoupon = resolveAppliedCoupon();
    const lines = getCartLineItems();

    if (lines.length === 0) {
        root.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i>
                <h2>Your basket is empty</h2>
                <p>Browse our products and add items to your basket, then order via WhatsApp.</p>
                <a href="products.html" class="btn btn-primary">
                    <i class="fa-solid fa-store" aria-hidden="true"></i> Browse Products
                </a>
            </div>
        `;
        return;
    }

    const exclude         = lines.map(l => l.product.productName);
    const recommendations = getRecommendations(exclude, 16);
    const lineCount       = lines.length;

    root.innerHTML = `
        <div class="cart-layout">
            <div class="cart-main">
                <div class="cart-header-row">
                    <h1 class="cart-page-title">
                        My Basket
                        <span class="cart-item-count">${lineCount} product${lineCount === 1 ? '' : 's'}</span>
                    </h1>
                    <button type="button" class="cart-clear-btn" id="basket-clear-btn">
                        <i class="fa-regular fa-trash-can" aria-hidden="true"></i> Clear basket
                    </button>
                </div>
                <p class="cart-page-intro">
                    ${lineCount} product${lineCount === 1 ? '' : 's'} selected. Send your list on WhatsApp and we will confirm your order quickly.
                </p>
                <div class="cart-lines" id="cart-lines">
                    ${lines.map(buildBasketLineHTML).join('')}
                </div>
                ${recommendations.length ? `
                    <section class="cart-recommendations" aria-label="You may also like">
                        <div class="cart-recommendations-header">
                            <h2>You may also like…</h2>
                        </div>
                        <div class="fp-grid fp-grid--basket-strip" id="cart-recommendations">
                            ${recommendations.map((p, i) => buildProductCardHTML(p, i, 0)).join('')}
                        </div>
                    </section>
                ` : ''}
            </div>
            ${buildBasketSummaryHTML(lines, appliedCoupon, couponError)}
        </div>
    `;

    bindBasketLineEvents(root);
    bindBasketSummaryEvents(root, lines);

    if (typeof bindProductCards === 'function') {
        const recGrid = root.querySelector('#cart-recommendations');
        if (recGrid) {
            bindProductCards(recGrid);
            if (typeof initFpGridAutoScroll === 'function') {
                initFpGridAutoScroll(recGrid, { minCards: 6, intervalMs: 2000 });
            }
        }
    }
}

function bindBasketSummaryEvents(container, lines) {
    const btn = container.querySelector('#whatsapp-order-btn');
    const updateHref = () => {
        const currentLines = getCartLineItems();
        const coupon = resolveAppliedCoupon();
        if (btn) {
            btn.href = buildWhatsAppOrderUrl(
                currentLines.length ? currentLines : lines,
                coupon
            );
        }
        updateOrderMessagePreview(container, currentLines.length ? currentLines : lines, coupon);
    };

    updateHref();

    const couponInput = container.querySelector('#coupon-code-input');
    const couponToggle = container.querySelector('#coupon-promo-toggle');
    const couponBody = container.querySelector('#coupon-section-body');
    if (couponToggle && couponBody) {
        couponToggle.addEventListener('click', () => {
            const isOpen = !couponBody.classList.contains('hidden');
            couponBody.classList.toggle('hidden', isOpen);
            couponToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            if (!isOpen && couponInput) couponInput.focus();
        });
    }
    if (couponInput) {
        couponInput.addEventListener('input', () => {
            const el = couponInput;
            const pos = el.selectionStart;
            const upper = el.value.toUpperCase();
            if (el.value !== upper) {
                el.value = upper;
                if (typeof pos === 'number') el.setSelectionRange(pos, pos);
            }
        });
    }

    container.querySelector('#coupon-apply-btn')?.addEventListener('click', async () => {
        const input = container.querySelector('#coupon-code-input');
        const code = (input?.value || '').trim().toUpperCase();
        if (!code) {
            renderBasketPage('Please enter a coupon code.');
            return;
        }
        await loadActiveCoupons();
        const coupon = activeCouponsMap[code];
        if (!coupon) {
            setStoredCouponCode('');
            renderBasketPage('Invalid or expired coupon code.');
            return;
        }
        setStoredCouponCode(code);
        showToast(`${code} applied — ${formatCouponDiscountLabel({ ...coupon, code })}`, 'basket');
        renderBasketPage();
    });

    container.querySelector('#coupon-code-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            container.querySelector('#coupon-apply-btn')?.click();
        }
    });

    container.querySelector('#coupon-remove-btn')?.addEventListener('click', () => {
        setStoredCouponCode('');
        showToast('Coupon removed', 'remove');
        renderBasketPage();
    });
}

function bindBasketLineEvents(container) {
    container.querySelectorAll('.cart-line').forEach(row => {
        const name = row.dataset.productName;

        row.querySelector('.qty-minus')?.addEventListener('click', () => {
            const line = getCartLineItems().find(l => l.product.productName === name);
            if (!line) return;
            if (line.quantity <= 1) removeFromCart(name);
            else setCartQuantity(name, line.quantity - 1);
        });

        row.querySelector('.qty-plus')?.addEventListener('click', () => {
            const line = getCartLineItems().find(l => l.product.productName === name);
            if (line) setCartQuantity(name, line.quantity + 1);
        });

        row.querySelector('.cart-line-remove')?.addEventListener('click', () => {
            removeFromCart(name);
        });
    });

    container.querySelector('#basket-clear-btn')?.addEventListener('click', async () => {
        const confirmed = await showConfirmDialog({
            title: 'Clear basket?',
            message: 'Clear your entire basket? This cannot be undone.',
            confirmLabel: 'Clear basket',
            cancelLabel: 'Cancel'
        });
        if (confirmed) clearCart();
    });
}

async function initBasketPage() {
    if (typeof ALL_PRODUCTS === 'undefined' || !ALL_PRODUCTS.length) {
        showPageLoadError('basket-page-root');
        return;
    }
    if (typeof GmsShoppingStore !== 'undefined') GmsShoppingStore.hydrate(true);
    await loadActiveCoupons();
    syncStoredCouponWithApi();
    renderBasketPage();
    document.removeEventListener('gms:basket-updated', onBasketUpdated);
    document.addEventListener('gms:basket-updated', onBasketUpdated);
}

function onBasketUpdated() {
    loadActiveCoupons().then(() => {
        syncStoredCouponWithApi();
        renderBasketPage();
    });
}

function showPageLoadError(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = `
        <div class="cart-empty">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <h2>Products could not be loaded</h2>
            <p>Please refresh the page. If you opened this file directly, use a local server instead.</p>
            <button type="button" class="btn btn-primary" onclick="location.reload()">
                <i class="fa-solid fa-rotate-right"></i> Refresh
            </button>
        </div>
    `;
}

function escStr(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
