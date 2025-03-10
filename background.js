// 
console.log("Service worker running");

// On install, initialize a badge or do other setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "OFF" });
  console.log("Extension installed!");
});

// Toggle the badge text on certain URLs
chrome.action.onClicked.addListener(async (tab) => {
  const extensionsUrl = 'https://developer.chrome.com/docs/extensions';
  const webstoreUrl   = 'https://developer.chrome.com/docs/webstore';
  let nextState       = "OFF";

  if (tab.url.startsWith(extensionsUrl) || tab.url.startsWith(webstoreUrl)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    nextState       = (prevState === 'ON') ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({ tabId: tab.id, text: nextState });
  }
});

// Listen for messages requesting price data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PRICES") {
    const product = message.data;
    console.log("Fetching competitor prices for product:", product);

    // ---- Mock Data ----
    const mockData = {
      results: [
        { store: "Amazon",    price: product.price || "$100.00", link: "https://amazon.com/dp/example" },
        { store: "eBay",      price: "$94.50",                    link: "https://ebay.com/itm/example" },
        { store: "Walmart",   price: "$97.99",                    link: "https://walmart.com/ip/example" },
        { store: "Best Buy",  price: "$99.50",                    link: "https://bestbuy.com/site/example" }
      ]
    };

    // Simulate an API delay
    setTimeout(() => {
      sendResponse(mockData);
    }, 1000);

    return true; // indicates async response
  }
});
