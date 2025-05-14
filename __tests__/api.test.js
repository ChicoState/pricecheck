const { API_CONFIG } = require('../services/config.js');
const { analyzeProduct, checkServerStatus } = require('../services/api.js');

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
  });

  describe('checkServerStatus', () => {
    it('should return true when server is running', async () => {
      fetch.mockImplementationOnce(() => Promise.resolve({ ok: true }));
      
      const result = await checkServerStatus();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(API_CONFIG.BASE_URL);
    });

    it('should return false when server is not running', async () => {
      fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
      
      const result = await checkServerStatus();
      expect(result).toBe(false);
      expect(fetch).toHaveBeenCalledWith(API_CONFIG.BASE_URL);
    });
  });

  describe('analyzeProduct', () => {
    const mockProductData = {
      productName: 'Test Product',
      price: '$99.99',
      domain: 'test.com'
    };

    it('should successfully analyze a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          alternatives: [
            { site: 'Amazon', price: '$89.99' }
          ]
        }
      };

      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await analyzeProduct(mockProductData);
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_PRODUCT}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockProductData)
        })
      );
    });

    it('should throw error when API request fails', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500
        })
      );

      await expect(analyzeProduct(mockProductData)).rejects.toThrow('HTTP error! status: 500');
    });
  });
});
