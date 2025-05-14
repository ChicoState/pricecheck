const { extractModelNumber, generateRetailerSearchUrls, storeProductData, updateBadge } = require('../services/background-service.js');

describe('Background Service', () => {
  describe('extractModelNumber', () => {
    it('should extract model numbers from various formats', () => {
      expect(extractModelNumber('Sony A7III Camera')).toBe('A7III');
      expect(extractModelNumber('iPhone 12 Pro')).toBe('12');
      expect(extractModelNumber('Model: XPS-15 Laptop')).toBe('XPS-15');
      expect(extractModelNumber('GT710-2GD5 Graphics Card')).toBe('GT710-2GD5');
    });

    it('should return Unknown for invalid input', () => {
      expect(extractModelNumber('')).toBe('Unknown');
      expect(extractModelNumber(null)).toBe('Unknown');
      expect(extractModelNumber('No model number here')).toBe('Unknown');
    });
  });

  describe('generateRetailerSearchUrls', () => {
    const searchTerms = 'test product';
    const currentPrice = '$99.99';
    const urls = generateRetailerSearchUrls(searchTerms, currentPrice);

    it('should generate URLs for all retailers', () => {
      expect(urls).toHaveLength(5);
      expect(urls.map(u => u.site)).toEqual([
        'Amazon',
        'eBay',
        'Walmart',
        'Best Buy',
        'Target'
      ]);
    });

    it('should properly encode search terms in URLs', () => {
      const searchTerms = 'test & product';
      const urls = generateRetailerSearchUrls(searchTerms, currentPrice);
      
      urls.forEach(url => {
        expect(url.searchUrl).toContain(encodeURIComponent(searchTerms));
      });
    });

    it('should include current price in Amazon notes', () => {
      const amazonUrl = urls.find(u => u.site === 'Amazon');
      expect(amazonUrl.notes).toBe(`Current Price: ${currentPrice}`);
    });
  });

  describe('storeProductData', () => {
    beforeEach(() => {
      // Mock chrome.storage.local
      global.chrome = {
        storage: {
          local: {
            set: jest.fn()
          }
        },
        runtime: {
          lastError: null
        }
      };
    });

    it('should store product data successfully', async () => {
      const mockData = { id: 1, name: 'Test Product' };
      chrome.storage.local.set.mockImplementation((data, callback) => callback());

      await expect(storeProductData(mockData)).resolves.toBeUndefined();
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { currentProduct: mockData },
        expect.any(Function)
      );
    });

    it('should reject when storage fails', async () => {
      const mockData = { id: 1, name: 'Test Product' };
      chrome.storage.local.set.mockImplementation((data, callback) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        callback();
      });

      await expect(storeProductData(mockData)).rejects.toEqual({ message: 'Storage error' });
    });
  });

  describe('updateBadge', () => {
    beforeEach(() => {
      // Mock chrome.action
      global.chrome.action = {
        setBadgeText: jest.fn()
      };
    });

    it('should update badge text for specific tab', () => {
      const text = '✓';
      const tabId = 123;
      
      updateBadge(text, tabId);
      
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
        text,
        tabId
      });
    });
  });
});
