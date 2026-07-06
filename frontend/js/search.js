let searchDebounceTimer = null;

function initSearch() {
    const searchInput = document.getElementById('header-search');
    const clearBtn = document.getElementById('search-clear');
    const dropdown = document.getElementById('search-dropdown');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            if (dropdown) showSearchSuggestions(query, dropdown, searchInput);
            if (document.body.dataset.page === 'products') {
                filterState.searchQuery = query;
                cachedFilterHash = '';
                applyFilters();
            }
        }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown) {
            hideSearchDropdown(dropdown);
            searchInput.blur();
        }
        if (e.key === 'Enter') {
            hideSearchDropdown(dropdown);
            if (document.body.dataset.page !== 'products') {
                const q = encodeURIComponent(searchInput.value.trim());
                window.location.href = `products.html?search=${q}`;
            }
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.remove('visible');
            hideSearchDropdown(dropdown);
            if (document.body.dataset.page === 'products') {
                filterState.searchQuery = '';
                cachedFilterHash = '';
                applyFilters();
            }
            searchInput.focus();
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-wrapper')) {
            hideSearchDropdown(dropdown);
        }
    });
}

function showSearchSuggestions(query, dropdown, input) {
    if (!dropdown) return;

    if (!query.trim()) {
        hideSearchDropdown(dropdown);
        return;
    }

    const q = query.trim().toLowerCase();
    const matches = ALL_PRODUCTS
        .filter(p =>
            p.displayName.toLowerCase().includes(q) ||
            p.productName.toLowerCase().includes(q)
        )
        .slice(0, 8);

    if (matches.length === 0) {
        dropdown.innerHTML = '<div class="search-dropdown-empty">No matching products</div>';
    } else {
        dropdown.innerHTML = matches.map(p => `
            <button class="search-suggestion" data-product-name="${p.productName}" type="button">
                <span class="suggestion-name">${highlightMatch(p.displayName, query)}</span>
                <span class="suggestion-category">${normalizeCategoryName(p.categoryName)}</span>
            </button>
        `).join('');
    }

    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');

    dropdown.querySelectorAll('.search-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = ALL_PRODUCTS.find(p => p.productName === btn.dataset.productName);
            if (product) {
                input.value = product.displayName;
                hideSearchDropdown(dropdown);
                if (document.body.dataset.page === 'products') {
                    filterState.searchQuery = product.displayName;
                    cachedFilterHash = '';
                    applyFilters();
                } else {
                    window.location.href = `products.html?search=${encodeURIComponent(product.displayName)}`;
                }
            }
        });
    });
}

function hideSearchDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-hidden', 'true');
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) +
        '<strong>' + text.slice(idx, idx + query.length) + '</strong>' +
        text.slice(idx + query.length);
}
