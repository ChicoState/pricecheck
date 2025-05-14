/**
 * Extract model number from product name using various patterns
 * @param {string} productName - Name of the product
 * @returns {string} Extracted model number or "Unknown"
 */
function extractModelNumber(productName) {
    if (!productName) return "Unknown";

    // Special case for iPhone/Galaxy model numbers
    const phoneMatch = productName.match(/\b(?:iphone|galaxy)\s*(\d+)\b/i);
    if (phoneMatch) {
        return phoneMatch[1];
    }

    // Model: XPS-15 format
    const modelMatch = productName.match(/\bmodel:\s*([A-Z0-9][A-Z0-9-]+)\b/i);
    if (modelMatch) {
        return modelMatch[1];
    }

    // Other patterns
    const patterns = [
        // A7III, etc.
        /\b[A-Z][0-9]+(?:III?|IV|V)?\b/i,
        // GT710-2GD5
        /\b[A-Z]{2,4}[0-9]{3,4}[-][A-Z0-9]{3,5}\b/i
    ];

    for (const pattern of patterns) {
        const match = productName.match(pattern);
        if (match) {
            return match[0];
        }
    }

    return "Unknown";
}

/**
 * Generate search URLs for various retailers
 * @param {string} searchTerms - Search terms to use
 * @param {string} currentPrice - Current price of the product
 * @returns {Array} Array of retailer objects with search URLs
 */
function generateRetailerSearchUrls(searchTerms, currentPrice) {
    return [
        {
            site: "Amazon",
            searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}`,
            notes: `Current Price: ${currentPrice || "$100.00"}`
        },
        {
            site: "eBay",
            searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerms)}`,
            notes: "Often has better prices on used items"
        },
        {
            site: "Walmart",
            searchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(searchTerms)}`,
            notes: "Check for price match guarantees"
        },
        {
            site: "Best Buy",
            searchUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(searchTerms)}`,
            notes: "Look for special promotions and bundles"
        },
        {
            site: "Target",
            searchUrl: `https://www.target.com/s?searchTerm=${encodeURIComponent(searchTerms)}`,
            notes: "Check for RedCard discounts"
        }
    ];
}

/**
 * Store product data in chrome.storage.local
 * @param {Object} productData - Product data to store
 * @returns {Promise} Promise that resolves when data is stored
 */
function storeProductData(productData) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ currentProduct: productData }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Update badge text for a specific tab
 * @param {string} text - Text to display on the badge
 * @param {number} tabId - ID of the tab to update
 */
function updateBadge(text, tabId) {
    chrome.action.setBadgeText({
        text: text,
        tabId: tabId
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractModelNumber, generateRetailerSearchUrls, storeProductData, updateBadge };
} else {
    window.backgroundService = { extractModelNumber, generateRetailerSearchUrls, storeProductData, updateBadge };
}
