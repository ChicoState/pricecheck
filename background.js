import { API_CONFIG } from './services/config.js';
import { analyzeProduct } from './services/api.js';
import { extractModelNumber, generateRetailerSearchUrls, storeProductData, updateBadge } from './services/background-service.js';

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
    storeProductData(request.data)
      .then(() => {
        console.log("Product data stored in local storage");
        // Set badge
        if (sender?.tab?.id) {
          updateBadge("✓", sender.tab.id);
        }
        // Send a response to confirm receipt
        sendResponse({ success: true, message: "Product data received" });
      })
      .catch(error => {
        console.error("Error storing data:", error);
        sendResponse({ success: false, message: "Error storing data" });
      });
  }
  else if (request.type === "FETCH_PRICES") {
    const product = request.data;
    console.log("Fetching competitor prices for product:", product);

    // Create search terms from product title
    const searchTerms = product.title || product.productName || "product";
    console.log("Using search terms:", searchTerms);

    // Generate mock data with search URLs
    const mockData = {
      success: true,
      data: {
        searchTerms: searchTerms,
        modelNumber: extractModelNumber(searchTerms),
        alternatives: generateRetailerSearchUrls(searchTerms, product.price)
      }
    };

    // Try to use the proxy server first
    analyzeProduct({
      productName: product.title || product.productName || "Unknown Product",
      price: product.price || "Unknown price",
      domain: product.domain || "current site"
    })
      .then(data => {
        console.log("Received data from server:", data);
        sendResponse(data);
      })
      .catch(error => {
        console.error("Error analyzing product:", error);
        // Fall back to mock data
        console.log("Using mock data instead:", mockData);
        sendResponse(mockData);
      });

    return true; // indicates async response
  }

  return true; // Always return true for async responses
});


