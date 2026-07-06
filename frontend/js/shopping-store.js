/* ============================================================
   GMS BASKET STORE — localStorage basket (product list for WhatsApp orders)
   Persists to localStorage (key: gms_basket_v1).
   ============================================================ */

const SHOPPING_STORE_KEY = 'gms_basket_v1';
const LEGACY_STORE_KEY   = 'gms_shopping_v2';
const LEGACY_BUCKET_KEY  = 'gms_bucket_v1';

const GmsShoppingStore = (function () {

    /** @type {Map<string, number>} productName → quantity */
    const basketByName = new Map();

    function resolveProduct(key) {
        return typeof resolveStoredProductKey === 'function'
            ? resolveStoredProductKey(key)
            : null;
    }

    function persist() {
        const payload = {
            v:    1,
            ts:   Date.now(),
            cart: Object.fromEntries(basketByName)
        };
        const json = JSON.stringify(payload);
        try { localStorage.setItem(SHOPPING_STORE_KEY, json); } catch (_) {}
        try { sessionStorage.setItem(SHOPPING_STORE_KEY, json); } catch (_) {}
    }

    function migrateLegacyStorage() {
        const keys = [LEGACY_STORE_KEY, LEGACY_BUCKET_KEY];
        for (const key of keys) {
            let raw = null;
            try { raw = localStorage.getItem(key); } catch (_) {}
            if (!raw) {
                try { raw = sessionStorage.getItem(key); } catch (_) {}
            }
            if (!raw) continue;

            try {
                const data = JSON.parse(raw);
                const cart = data?.cart || data?.bucket;
                if (cart && typeof cart === 'object') {
                    Object.entries(cart).forEach(([name, qty]) => {
                        const amount = parseInt(qty, 10) || 0;
                        if (name && amount > 0) basketByName.set(name, amount);
                    });
                    persist();
                }
                try { localStorage.removeItem(key); } catch (_) {}
                try { sessionStorage.removeItem(key); } catch (_) {}
            } catch (_) {}
        }
    }

    function loadFromStorage() {
        basketByName.clear();
        migrateLegacyStorage();

        let raw = null;
        try { raw = localStorage.getItem(SHOPPING_STORE_KEY); } catch (_) {}
        if (!raw) {
            try { raw = sessionStorage.getItem(SHOPPING_STORE_KEY); } catch (_) {}
        }
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return;
            const cart = data.cart || data.basket;
            if (cart && typeof cart === 'object') {
                Object.entries(cart).forEach(([name, qty]) => {
                    const amount = parseInt(qty, 10) || 0;
                    if (name && amount > 0) basketByName.set(name, amount);
                });
            }
        } catch (_) {}
    }

    function cleanOldKeys() {
        ['gms_cart_v1', 'gms_favs_v1', 'gms_migrated_v2', 'gms_shopping_v3', 'gms_bucket_v1'].forEach(k => {
            try { localStorage.removeItem(k); } catch (_) {}
            try { sessionStorage.removeItem(k); } catch (_) {}
        });
    }

    let _ready = false;

    function ensureReady() {
        if (_ready) return;
        _ready = true;
        cleanOldKeys();
        loadFromStorage();
    }

    function emitBasket() {
        document.dispatchEvent(new CustomEvent('gms:basket-updated'));
        document.dispatchEvent(new CustomEvent('gms:cart-updated'));
    }

    function refreshBadges() {
        if (typeof updateHeaderBadges === 'function') updateHeaderBadges();
    }

    function getCartMapObject() {
        ensureReady();
        return Object.fromEntries(basketByName);
    }

    function getCartCount() {
        ensureReady();
        let total = 0;
        basketByName.forEach(qty => { total += qty; });
        return total;
    }

    function getCartItemCount() {
        ensureReady();
        return basketByName.size;
    }

    function isInCart(productName) {
        ensureReady();
        const p = resolveProduct(productName);
        return p ? basketByName.has(p.productName) : false;
    }

    function getCartQty(productName) {
        ensureReady();
        const p = resolveProduct(productName);
        if (!p) return 0;
        return basketByName.get(p.productName) || 0;
    }

    function addToCartStore(productName, quantity) {
        ensureReady();
        const qty  = Math.max(1, parseInt(quantity, 10) || 1);
        const p    = resolveProduct(productName);
        const name = p ? p.productName : String(productName).trim();
        if (!name) return null;
        basketByName.set(name, (basketByName.get(name) || 0) + qty);
        persist();
        return p;
    }

    function setCartQuantityStore(productName, quantity) {
        ensureReady();
        const p    = resolveProduct(productName);
        const name = p ? p.productName : String(productName).trim();
        if (!name) return;
        const qty = parseInt(quantity, 10) || 0;
        if (qty <= 0) basketByName.delete(name);
        else          basketByName.set(name, qty);
        persist();
    }

    function removeFromCartStore(productName) {
        ensureReady();
        const p    = resolveProduct(productName);
        const name = p ? p.productName : String(productName).trim();
        if (name) basketByName.delete(name);
        persist();
    }

    function clearCartStore() {
        ensureReady();
        basketByName.clear();
        persist();
    }

    function reloadFromStorage() {
        _ready = false;
        ensureReady();
        emitBasket();
        refreshBadges();
    }

    window.addEventListener('storage', (e) => {
        if (e.key === SHOPPING_STORE_KEY || e.key === LEGACY_BUCKET_KEY) reloadFromStorage();
    });

    return {
        hydrate: ensureReady,
        reloadFromStorage,
        getCartMapObject,
        getCartCount,
        getCartItemCount,
        isInCart,
        getCartQty,
        addToCartStore,
        setCartQuantityStore,
        removeFromCartStore,
        clearCartStore,
        emitBasket,
        emitBucket: emitBasket,
        refreshBadges
    };
})();
