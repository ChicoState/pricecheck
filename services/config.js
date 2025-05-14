// API configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
        ANALYZE_PRODUCT: '/api/analyze-product',
        SERVER_STATUS: '/'
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG };
} else {
    window.API_CONFIG = API_CONFIG;
}
