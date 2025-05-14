/**
 * Extract product data from current webpage
 * Supports multiple e-commerce sites with fallbacks for generic sites
 * @returns {Object} Extracted product data
 */
function extractProductData() {
  let title = "";
  let price = "";
  let domain = window.location.hostname;
  let url = window.location.href;

  console.log("Extracting product data from: " + domain);

  // Amazon-specific extraction
  if (domain.includes('amazon')) {
    // Title extraction
    title = document.querySelector("#productTitle")?.textContent.trim() || "";
    
    // Price extraction - try multiple selectors
    const priceElement = document.querySelector("#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen");
    if (priceElement) {
      price = priceElement.textContent.trim();
    } else {
      const priceElements = document.querySelectorAll('.a-price');
      if (priceElements.length > 0) {
        const offscreenPrice = priceElements[0].querySelector('.a-offscreen');
        price = offscreenPrice ? offscreenPrice.textContent.trim() : priceElements[0].textContent.trim();
      }
    }
  }
  
  // Walmart-specific extraction
  else if (domain.includes('walmart')) {
    // Try different title selectors in order of preference
    const titleSelectors = [
      "h1.prod-ProductTitle",
      "[data-automation-id='product-title']",
      ".product-title"
    ];
    
    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement) {
        title = titleElement.textContent.trim();
        break;
      }
    }
    
    // Try different price selectors in order of preference
    const priceSelectors = [
      "span.price-characteristic",
      "[data-automation-id='product-price']",
      ".product-price"
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement) {
        price = priceElement.textContent.trim();
        break;
      }
    }
  }
  
  // eBay-specific extraction
  else if (domain.includes('ebay')) {
    // eBay often prefixes titles with "Details about"
    const ebayTitle = document.querySelector("#itemTitle")?.textContent || "";
    title = ebayTitle.replace(/^Details about\s+/, "").trim();
    price = document.querySelector("#prcIsum, #mm-saleDscPrc")?.textContent.trim() || "";
  }
  
  // Best Buy-specific extraction
  else if (domain.includes('bestbuy')) {
    title = document.querySelector('.sku-title h1')?.textContent.trim() || "";
    price = document.querySelector('.priceView-customer-price span')?.textContent.trim() || "";
  }

  if (!title) {
    const possibleTitleElements = document.querySelectorAll('h1, [class*="title"], [id*="title"], [class*="product-name"], [id*="product-name"]');
    if (possibleTitleElements.length > 0) {
      title = possibleTitleElements[0].textContent.trim();
    } else {
      title = document.title;
    }
  }

  if (!price) {
    const salePriceElement = document.querySelector('.sale-price');
    if (salePriceElement) {
      price = salePriceElement.textContent.trim();
    } else {
      const possiblePriceElements = document.querySelectorAll('[class*="price"], [id*="price"], .price, #price');
      if (possiblePriceElements.length > 0) {
        const priceText = possiblePriceElements[0].textContent.trim();
        
        const dollarMatch = priceText.match(/\$\s*(\d+(?:\.\d{2})?)/);
        if (dollarMatch) {
          price = `$${dollarMatch[1]}`;
        } else {
          const usdMatch = priceText.match(/USD\s*(\d+(?:\.\d{2})?)/i);
          if (usdMatch) {
            price = `$${usdMatch[1]}`;
          } else {
            const numberMatch = priceText.match(/(\d+\.\d{2})/);
            if (numberMatch) {
              price = `$${numberMatch[0]}`;
            } else {
              price = priceText;
            }
          }
        }
      } else {
        price = "Price not found";
      }
    }
  }

  if (price && price.match(/^\d/) && !price.startsWith('$')) {
    price = `$${price}`;
  }

  console.log("Extracted product data:", { title, price, domain, url });
  
  return {
    title,
    price,
    domain,
    url,
    productName: title // For API compatibility
  };
}

/**
 * Send the extracted product data to the background script
 */
function autoExtractAndSendData() {
  const productData = extractProductData();
  
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DATA',
      data: productData
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error sending product data:', chrome.runtime.lastError);
      }
    });
  } else {
    console.log('Chrome runtime not available for sending messages');
  }
}

// Auto-execute if not in test environment
if (typeof jest === 'undefined' && typeof window !== 'undefined') {
  autoExtractAndSendData();
}

// Export functions for testing and module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractProductData,
    autoExtractAndSendData
  };
} else if (typeof window !== 'undefined') {
  window.contentPrice = {
    extractProductData,
    autoExtractAndSendData
  };
}