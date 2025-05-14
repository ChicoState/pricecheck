const { API_CONFIG } = require('../services/config.js');
const { checkServerStatus, analyzeProduct, fetchPricesViaBackground } = require('../services/api.js');

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
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

    it('should return false when server returns non-ok response', async () => {
      fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));
      
      const result = await checkServerStatus();
      expect(result).toBe(false);
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

    it('should handle API errors', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500
        })
      );

      await expect(analyzeProduct(mockProductData)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await expect(analyzeProduct(mockProductData)).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON response', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );

      await expect(analyzeProduct(mockProductData)).rejects.toThrow('Invalid JSON');
    });
  });

  describe('fetchPricesViaBackground', () => {
    const mockProductData = {
      productName: 'Test Product',
      price: '$99.99'
    };

    it('should send message and handle success response', async () => {
      const mockResponse = { success: true };
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback(mockResponse);
      });

      const result = await fetchPricesViaBackground(mockProductData);
      expect(result).toEqual(mockResponse);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { type: 'FETCH_PRICES', data: mockProductData },
        expect.any(Function)
      );
    });

    it('should handle runtime errors', async () => {
      chrome.runtime.lastError = { message: 'Runtime error' };
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback();
      });

      await expect(fetchPricesViaBackground(mockProductData)).rejects.toEqual(
        { message: 'Runtime error' }
      );

      chrome.runtime.lastError = undefined;
    });
  });
});
