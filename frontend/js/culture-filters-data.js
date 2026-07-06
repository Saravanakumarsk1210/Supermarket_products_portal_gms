/* Kitchen culture filters — definitions from API; products filtered by kitchenCulture field */

let KITCHEN_CULTURE_DEFS = [];

async function loadKitchenCultureDefs() {
    if (KITCHEN_CULTURE_DEFS.length) return KITCHEN_CULTURE_DEFS;
    try {
        const res = await fetch('/api/v1/kitchen-cultures');
        if (res.ok) {
            KITCHEN_CULTURE_DEFS = await res.json();
        }
    } catch (err) {
        console.error('Kitchen cultures fetch failed:', err);
    }
    if (!KITCHEN_CULTURE_DEFS.length) {
        KITCHEN_CULTURE_DEFS = [
            { key: 'asian', label: 'Asian Kitchen' },
            { key: 'chinese', label: 'Chinese Kitchen' },
            { key: 'british', label: 'British Kitchen' },
            { key: 'english', label: 'England Kitchen' },
            { key: 'sri-lankan', label: 'Sri Lankan Kitchen' },
            { key: 'turkish', label: 'Turkish Kitchen' },
        ];
    }
    return KITCHEN_CULTURE_DEFS;
}

function getProductsForCultures(cultureKeys) {
    if (!cultureKeys.length || typeof ALL_PRODUCTS === 'undefined') return [];
    const keys = new Set(cultureKeys);
    return ALL_PRODUCTS.filter(p => p.kitchenCulture && keys.has(p.kitchenCulture));
}

function getCultureLabel(key) {
    const def = KITCHEN_CULTURE_DEFS.find(c => c.key === key);
    return def ? def.label : key;
}
