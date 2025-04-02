function extractProductData() {
  let title = "";
  let price = "";
  let domain = window.location.hostname;
  let url = window.location.href;

  console.log("Extracting product data from: " + domain);

  // Common selectors for Amazon
  if (domain.includes('amazon')) {
    title = document.querySelector("#productTitle")?.textContent.trim();
    price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen")?.textContent.trim();
    if (!price) {
      const priceElements = document.querySelectorAll('.a-price');
      if (priceElements.length > 0) {
        price = priceElements[0].textContent.trim();
      }
    }
  }

  // Walmart selectors
  else if (domain.includes('walmart')) {
    title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
    if (!title) {
      title = document.querySelector("[data-automation-id='product-title']")?.textContent.trim();
    }
    price = document.querySelector("span.price-characteristic")?.textContent.trim();
    if (!price) {
      price = document.querySelector("[data-automation-id='product-price']")?.textContent.trim();
    }
  }

  // eBay selectors
  else if (domain.includes('ebay')) {
    title = document.querySelector("#itemTitle")?.textContent.replace("Details about  \xa0", "").trim();
    price = document.querySelector("#prcIsum, #mm-saleDscPrc")?.textContent.trim();
  }

  // Best Buy selectors
  else if (domain.includes('bestbuy')) {
    title = document.querySelector('.sku-title h1')?.textContent.trim();
    price = document.querySelector('.priceView-customer-price span')?.textContent.trim();
  }

  // Generic fallback
  if (!title) {
    // Try to find product name by common patterns
    const possibleTitleElements = document.querySelectorAll('h1, [class*="title"], [id*="title"], [class*="product-name"], [id*="product-name"]');
    if (possibleTitleElements.length > 0) {
      title = possibleTitleElements[0].textContent.trim();
    } else {
      title = document.title;
    }
  }

  if (!price) {
    // Try to find price by common patterns
    const possiblePriceElements = document.querySelectorAll('[class*="price"], [id*="price"], .price, #price');
    if (possiblePriceElements.length > 0) {
      const priceText = possiblePriceElements[0].textContent.trim();
      // Basic regex to extract price in format $XX.XX or XX.XX
      const priceMatch = priceText.match(/\$?(\d+\.\d{2})/);
      price = priceMatch ? priceMatch[0] : priceText;
    } else {
      price = "Price not found";
    }
  }

  console.log("Extracted product data:", { title, price, domain, url });
  return {
    title,
    price,
    domain,
    url,
    productName: title // Add productName for compatibility with our API
  };
}

// Automatically send the extracted product data to the extension
const productData = extractProductData();
chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });