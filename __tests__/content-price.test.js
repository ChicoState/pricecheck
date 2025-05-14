describe('content-price.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage.mockClear();
      chrome.runtime.lastError = undefined;
    }
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '';
    window.location = new URL('http://localhost/');
    
    jest.resetModules();
  });

  test('chrome.runtime.sendMessage should be called when sending price data', async () => {
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    });
    
    document.body.innerHTML = `
      <div class="price">$99.99</div>
    `;

    require('../content-price.js');
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'PRODUCT_DATA',
        data: {
          domain: 'localhost',
          price: '$99.99',
          productName: '',
          title: '',
          url: 'http://localhost/'
        }
      },
      expect.any(Function)
    );
  });

  test('should extract price from standard price element', () => {
    document.body.innerHTML = `
      <div class="price">
        <span>$99.99</span>
      </div>
    `;
    require('../content-price.js');

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'PRODUCT_DATA',
        data: {
          domain: 'localhost',
          price: '$99.99',
          productName: '',
          title: '',
          url: 'http://localhost/'
        }
      },
      expect.any(Function)
    );
  });

  test('should extract price from multiple price formats', () => {
    document.body.innerHTML = `
      <div>
        <span class="price">USD 199.99</span>
        <span class="sale-price">$149.99</span>
      </div>
    `;
    require('../content-price.js');

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: '$149.99'
        })
      }),
      expect.any(Function)
    );
  });

  test('should handle missing price elements', () => {
    document.body.innerHTML = '<div>No price here</div>';
    require('../content-price.js');
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: 'Price not found',
          title: 'No price here',
          domain: 'localhost',
          url: 'http://localhost/',
          productName: 'No price here'
        })
      }),
      expect.any(Function)
    );
  });

  test('should handle Amazon product pages', () => {
    delete window.location;
    window.location = new URL('https://amazon.com/product');

    document.body.innerHTML = `
      <h1 id="productTitle">Test Product</h1>
      <div class="a-price">
        <span class="a-offscreen">$29.99</span>
      </div>
    `;

    const { extractProductData } = require('../content-price.js');
    const result = extractProductData();

    expect(result).toEqual({
      title: 'Test Product',
      price: '$29.99',
      domain: 'amazon.com',
      url: 'https://amazon.com/product',
      productName: 'Test Product'
    });
  });

  test('should handle Walmart product pages', () => {
    delete window.location;
    window.location = new URL('https://walmart.com/product');

    document.body.innerHTML = `
      <h1 class="prod-ProductTitle">Walmart Product</h1>
      <span class="price-characteristic">$19.99</span>
    `;

    const { extractProductData } = require('../content-price.js');
    const result = extractProductData();

    expect(result).toEqual({
      title: 'Walmart Product',
      price: '$19.99',
      domain: 'walmart.com',
      url: 'https://walmart.com/product',
      productName: 'Walmart Product'
    });
  });
});

