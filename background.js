// Proxy server endpoint
const PROXY_SERVER_URL = 'http://localhost:3000/api/analyze-product';

console.log("Service worker running");

// On install, initialize a badge or do other setup
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed!");
  chrome.action.setBadgeText({ text: "OFF" });
  if(details.reason === 'install'){
    chrome.notifications.create('pricechecker_install_notification',{
	    type: 'basic',
	    iconUrl: 'pricechecker.png',
	    title: "Pricechecker Installed!",
	    message: "Click the puzzle piece and pin Pricecheker for easy access!",
	    priority: 2
    });
   }
});


//check price button clicked
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    chrome.action.openPopup();
  }
});


// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request.type, request);

  if (request.type === "PRODUCT_DATA") {
    // Store product data when received from content script
    console.log("Storing product data:", request.data);
    chrome.storage.local.set({ currentProduct: request.data }, () => {
      console.log("Product data stored in local storage");
      if (chrome.runtime.lastError) {
        console.error("Error storing data:", chrome.runtime.lastError);
      }
    });

    // Set badge
    if (sender && sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({
        text: "✓",
        tabId: sender.tab.id
      });
    }

    // Send a response to confirm receipt
    sendResponse({ success: true, message: "Product data received" });
  }
  else if (request.type === "FETCH_PRICES") {
    const product = request.data;
    console.log("Fetching competitor prices for product:", product);

    // Create search terms from product title
    const searchTerms = product.title || product.productName || "product";
    console.log("Using search terms:", searchTerms);

    // Generate proper search URLs
    const mockData = {
      success: true,
      data: {
        searchTerms: searchTerms,
        modelNumber: extractModelNumber(searchTerms),
        alternatives: [
          {
            site: "Amazon",
            searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}`,
            notes: `Current Price: ${product.price || "$100.00"}`
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
        ]
      }
    };

    // Try to use the proxy server first
    try {
      fetch(PROXY_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productInfo: {
            productName: product.title || product.productName || "Unknown Product",
            price: product.price || "Unknown price",
            domain: product.domain || window.location?.hostname || "current site"
          }
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Received data from server:", data);
          sendResponse(data);
        })
        .catch(error => {
          console.error("Error fetching from server:", error);
          // Fall back to mock data
          console.log("Using mock data instead:", mockData);
          sendResponse(mockData);
        });
    } catch (error) {
      console.error("Exception when calling server:", error);
      // Fall back to mock data
      console.log("Using mock data instead due to exception:", mockData);
      sendResponse(mockData);
    }

    return true; // indicates async response
  }

  return true; // Always return true for async responses
});

// Helper function to extract model numbers
function extractModelNumber(productName) {
  if (!productName) return "Unknown";

  // Common model number patterns
  const patterns = [
    /\b[A-Z0-9]{1,2}[-_]?[A-Z0-9]{2,5}\b/i,    // G502, XPS-15, etc
    /\b(model|part)[-_:\s]?([A-Z0-9]{4,10})\b/i,  // Model: ABC123
    /\b[A-Z][0-9]{3,5}\b/i,                   // S2000, X300, etc
    /\b([A-Z]{1,4}[0-9]{1,5}[-][A-Z0-9]{1,5})\b/i // MT-2000X, GT710-2GD5
  ];

  for (const pattern of patterns) {
    const match = productName.match(pattern);
    if (match) {
      // Return either the 2nd capture group or the full match
      return match[2] || match[0];
    }
  }

  return "Unknown";
}
