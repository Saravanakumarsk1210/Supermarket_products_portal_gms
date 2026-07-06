let lastTriggerElement = null;

function renderGrid(products, totalCount) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <p>No products match your current filters.</p>
                <button class="btn btn-primary" id="no-results-clear">Clear Filters</button>
            </div>
        `;
        const clearBtn = document.getElementById('no-results-clear');
        if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
        return;
    }

    grid.innerHTML = products.map((product, index) =>
        buildProductCardHTML(product, index, 0, { hideDiscount: true })
    ).join('');

    grid.querySelectorAll('.fp-card').forEach((card, index) => {
        const product = products[index];
        card.classList.add('fade-in-item');
        card.setAttribute('role', 'article');
        if (product) card.setAttribute('aria-label', product.displayName);
        card.style.transitionDelay = `${Math.min(index * 50, 400)}ms`;
    });

    bindProductCards(grid, {
        onOpen: (_product, trigger) => {
            lastTriggerElement = trigger;
        }
    });

    observeFadeElements(grid.querySelectorAll('.fade-in-item'));
}

function renderPagination(totalCount) {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.max(1, Math.ceil(totalCount / filterState.perPage));
    const current = filterState.currentPage;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pages = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    container.innerHTML = `
        <div class="pagination-info">Page ${current} of ${totalPages}</div>
        <div class="pagination-controls">
            <button class="pagination-btn" data-page="first" ${current === 1 ? 'disabled' : ''} aria-label="First page">
                <i class="fa-solid fa-angles-left" aria-hidden="true"></i>
            </button>
            <button class="pagination-btn" data-page="prev" ${current === 1 ? 'disabled' : ''} aria-label="Previous page">
                <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>
            ${pages.map(p => `
                <button class="pagination-btn page-num ${p === current ? 'active' : ''}" data-page="${p}" aria-label="Page ${p}" ${p === current ? 'aria-current="page"' : ''}>
                    ${p}
                </button>
            `).join('')}
            <button class="pagination-btn" data-page="next" ${current === totalPages ? 'disabled' : ''} aria-label="Next page">
                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
            <button class="pagination-btn" data-page="last" ${current === totalPages ? 'disabled' : ''} aria-label="Last page">
                <i class="fa-solid fa-angles-right" aria-hidden="true"></i>
            </button>
        </div>
    `;

    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.page;
            if (btn.disabled) return;

            if (action === 'first') filterState.currentPage = 1;
            else if (action === 'prev') filterState.currentPage = Math.max(1, current - 1);
            else if (action === 'next') filterState.currentPage = Math.min(totalPages, current + 1);
            else if (action === 'last') filterState.currentPage = totalPages;
            else filterState.currentPage = parseInt(action, 10);

            applyFilters(true);
            scrollToGrid();
        });
    });
}

function updateResultCount(showing, total) {
    const el = document.getElementById('result-count');
    if (el) el.textContent = `Showing ${showing} of ${total.toLocaleString()} products`;
}

function scrollToGrid() {
    const grid = document.getElementById('product-grid');
    if (grid) {
        const offset = 100;
        const top = grid.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

function getLastTriggerElement() {
    return lastTriggerElement;
}

function observeFadeElements(elements) {
    if (!window.fadeObserver) return;
    elements.forEach(el => window.fadeObserver.observe(el));
}
