let API_CONFIG;

if (typeof require !== 'undefined') {
    const config = require('./config.js');
    API_CONFIG = config.API_CONFIG;
} else {
    API_CONFIG = window.API_CONFIG;
}

/**
 * Check the server status
 * @returns {Promise<boolean>} True if server is running, false otherwise
 */
async function checkServerStatus() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL);
        return response.ok;
    } catch (error) {
        console.error('Error checking server status:', error);
        return false;
    }
}

/**
 * Analyze a product and get competitor prices
 * @param {Object} productData - Product data to analyze
 * @param {string} productData.url - Product URL
 * @param {string} productData.title - Product title
 * @param {string} productData.price - Product price
 * @returns {Promise<Object>} Analyzed product data with competitor prices
 */
async function analyzeProduct(productData) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_PRODUCT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error analyzing product:', error);
        throw error;
    }
}

/**
 * Send product data to background script for price fetching
 * @param {Object} productData - Product data to analyze
 * @returns {Promise<Object>} Response from background script
 */
function fetchPricesViaBackground(productData) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "FETCH_PRICES", data: productData },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            }
        );
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkServerStatus, analyzeProduct, fetchPricesViaBackground };
} else {
    window.apiService = { checkServerStatus, analyzeProduct, fetchPricesViaBackground };
}
