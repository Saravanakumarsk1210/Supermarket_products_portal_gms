'use strict';

const AdminAPI = {
    TOKEN_KEY: 'gms_admin_token_v2',
    USER_KEY: 'gms_admin_user_v2',
    _productsAbort: null,

    /** API base — same origin when served via http(s); required for fetch() to work. */
    get baseUrl() {
        if (window.location.protocol === 'file:') return '';
        return window.location.origin;
    },

    url(path) {
        return `${this.baseUrl}${path}`;
    },

    getToken() {
        try {
            let token = sessionStorage.getItem(this.TOKEN_KEY);
            if (!token) {
                token = localStorage.getItem(this.TOKEN_KEY);
                if (token) {
                    sessionStorage.setItem(this.TOKEN_KEY, token);
                    const user = localStorage.getItem(this.USER_KEY);
                    if (user) sessionStorage.setItem(this.USER_KEY, user);
                    localStorage.removeItem(this.TOKEN_KEY);
                    localStorage.removeItem(this.USER_KEY);
                }
            }
            return token;
        } catch (_) { return null; }
    },

    setSession(token, user) {
        try {
            sessionStorage.setItem(this.TOKEN_KEY, token);
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (_) {}
    },

    clearSession() {
        try {
            sessionStorage.removeItem(this.TOKEN_KEY);
            sessionStorage.removeItem(this.USER_KEY);
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        } catch (_) {}
    },

    getUser() {
        try {
            const raw = sessionStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    },

    async request(path, options = {}) {
        const headers = { ...(options.headers || {}) };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(this.url(path), { ...options, headers });
        let data = null;
        const text = await res.text();
        if (text) {
            try { data = JSON.parse(text); } catch (_) { data = text; }
        }
        if (!res.ok) {
            const msg = (data && data.detail) ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : res.statusText;
            const err = new Error(msg || 'Request failed');
            err.status = res.status;
            throw err;
        }
        return data;
    },

    login(email, password) {
        return this.request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    logout() {
        const token = this.getToken();
        if (token) {
            return this.request('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
        }
        return Promise.resolve();
    },

    me() { return this.request('/api/v1/auth/me'); },

    dashboard() { return this.request('/api/v1/admin/dashboard'); },
    spotlight() { return this.request('/api/v1/admin/spotlight'); },
    stats() { return this.request('/api/v1/admin/stats'); },

    categories() { return this.request('/api/v1/admin/categories'); },
    createCategory(body) { return this.request('/api/v1/admin/categories', { method: 'POST', body: JSON.stringify(body) }); },
    updateCategory(id, body) { return this.request(`/api/v1/admin/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }); },
    deleteCategory(id) { return this.request(`/api/v1/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }); },

    subcategories(categoryId) {
        const q = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
        return this.request(`/api/v1/admin/subcategories${q}`);
    },
    createSubcategory(body) { return this.request('/api/v1/admin/subcategories', { method: 'POST', body: JSON.stringify(body) }); },
    updateSubcategory(id, body) { return this.request(`/api/v1/admin/subcategories/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }); },
    deleteSubcategory(id) { return this.request(`/api/v1/admin/subcategories/${encodeURIComponent(id)}`, { method: 'DELETE' }); },

    products(params = {}, { cancelPrevious = true } = {}) {
        if (cancelPrevious && this._productsAbort) {
            this._productsAbort.abort();
        }
        const controller = new AbortController();
        if (cancelPrevious) this._productsAbort = controller;

        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) qs.set(k, v); });
        return this.request(`/api/v1/admin/products?${qs}`, { signal: controller.signal });
    },
    product(id) {
        return this.request(`/api/v1/admin/products/${encodeURIComponent(id)}`);
    },
    createProduct(body) { return this.request('/api/v1/admin/products', { method: 'POST', body: JSON.stringify(body) }); },
    updateProduct(id, body) { return this.request(`/api/v1/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) }); },
    deleteProduct(id) { return this.request(`/api/v1/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
    bulkProducts(body) { return this.request('/api/v1/admin/products/bulk', { method: 'POST', body: JSON.stringify(body) }); },
    discountedProducts() { return this.request('/api/v1/admin/products/discounted'); },
    bulkDiscount(body) { return this.request('/api/v1/admin/products/bulk-discount', { method: 'POST', body: JSON.stringify(body) }); },
    clearDiscounts() { return this.request('/api/v1/admin/products/clear-discounts', { method: 'POST' }); },

    productImages(productId) {
        return this.request(`/api/v1/admin/products/${encodeURIComponent(productId)}/images`);
    },
    addProductImageUrl(productId, body) {
        return this.request(`/api/v1/admin/products/${encodeURIComponent(productId)}/images`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    uploadProductImages(productId, files, isPrimary = false) {
        const fd = new FormData();
        files.forEach(file => fd.append('files', file));
        if (isPrimary) fd.append('is_primary', 'true');
        return this.request(`/api/v1/admin/products/${encodeURIComponent(productId)}/images/upload`, {
            method: 'POST',
            body: fd,
        });
    },
    setPrimaryProductImage(productId, imageId) {
        return this.request(`/api/v1/admin/products/${encodeURIComponent(productId)}/images/${imageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_primary: true }),
        });
    },
    deleteProductImage(productId, imageId) {
        return this.request(`/api/v1/admin/products/${encodeURIComponent(productId)}/images/${imageId}`, {
            method: 'DELETE',
        });
    },

    banners() { return this.request('/api/v1/admin/banners'); },
    createBanner(body) { return this.request('/api/v1/admin/banners', { method: 'POST', body: JSON.stringify(body) }); },
    updateBanner(id, body) { return this.request(`/api/v1/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) }); },
    moveBanner(id, direction) {
        return this.request(`/api/v1/admin/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ direction }),
        });
    },
    deleteBanner(id) { return this.request(`/api/v1/admin/banners/${id}`, { method: 'DELETE' }); },
    uploadBannerImage(file) {
        const fd = new FormData();
        fd.append('file', file);
        return this.request('/api/v1/admin/banners/upload', { method: 'POST', body: fd });
    },

    cultures() { return this.request('/api/v1/admin/cultures'); },
    kitchenCultures() { return this.request('/api/v1/admin/kitchen-cultures'); },
    createCulture(body) { return this.request('/api/v1/admin/cultures', { method: 'POST', body: JSON.stringify(body) }); },
    updateCulture(id, body) { return this.request(`/api/v1/admin/cultures/${id}`, { method: 'PUT', body: JSON.stringify(body) }); },
    moveCulture(id, direction) {
        return this.request(`/api/v1/admin/cultures/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ direction }),
        });
    },
    deleteCulture(id) { return this.request(`/api/v1/admin/cultures/${id}`, { method: 'DELETE' }); },
    uploadCultureImage(file) {
        const fd = new FormData();
        fd.append('file', file);
        return this.request('/api/v1/admin/cultures/upload', { method: 'POST', body: fd });
    },

    testimonials() { return this.request('/api/v1/admin/testimonials'); },
    createTestimonial(body) { return this.request('/api/v1/admin/testimonials', { method: 'POST', body: JSON.stringify(body) }); },
    updateTestimonial(id, body) { return this.request(`/api/v1/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(body) }); },
    deleteTestimonial(id) { return this.request(`/api/v1/admin/testimonials/${id}`, { method: 'DELETE' }); },

    newsletter() { return this.request('/api/v1/admin/newsletter'); },
    createNewsletterSubscriber(body) {
        return this.request('/api/v1/admin/newsletter', { method: 'POST', body: JSON.stringify(body) });
    },
    updateNewsletterSubscriber(id, body) {
        return this.request(`/api/v1/admin/newsletter/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteNewsletterSubscriber(id) {
        return this.request(`/api/v1/admin/newsletter/${id}`, { method: 'DELETE' });
    },
    unsubscribe(id) { return this.request(`/api/v1/admin/newsletter/${id}`, { method: 'PATCH' }); },

    settings() { return this.request('/api/v1/admin/settings'); },
    saveSettings(body) { return this.request('/api/v1/admin/settings', { method: 'PUT', body: JSON.stringify(body) }); },

    brands() { return this.request('/api/v1/admin/brands'); },

    coupons() { return this.request('/api/v1/admin/coupons'); },
    saveCoupons(coupons) {
        return this.request('/api/v1/admin/coupons', { method: 'PUT', body: JSON.stringify(coupons) });
    },

    contactSubmissions() { return this.request('/api/v1/admin/contact-submissions'); },
    markContactRead(id) { return this.request(`/api/v1/admin/contact-submissions/${id}/read`, { method: 'PUT' }); },
    deleteContactSubmission(id) { return this.request(`/api/v1/admin/contact-submissions/${id}`, { method: 'DELETE' }); },
};
