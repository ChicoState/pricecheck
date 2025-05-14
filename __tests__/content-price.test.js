describe('content-price.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the DOM
    document.body.innerHTML = '';
  });

  test('chrome.runtime.sendMessage should be called when sending price data', async () => {
    // Mock chrome.runtime.sendMessage to resolve successfully
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    });
    
    // Create a sample price element
    document.body.innerHTML = `
      <div class="price">$99.99</div>
    `;

    // Import and run the content script
    require('../content-price.js');

    // Verify that sendMessage was called with correct data
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

  test('should handle missing price elements', async () => {
    // Import and run the content script
    require('../content-price.js');

    // Verify that sendMessage was not called when no price element exists
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });
});
