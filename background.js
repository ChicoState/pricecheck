// // // content-price.js
// // console.log("Service worker running");

// // // On install, set the badge text or initialize state if needed
// // chrome.runtime.onInstalled.addListener(() => {
// //   chrome.action.setBadgeText({ text: "OFF" });
// //   console.log("Extension installed!");
// // });

// // // Toggle the badge text when user clicks on extension icon if they're on certain URLs
// // chrome.action.onClicked.addListener(async (tab) => {
// //   const extensionsUrl = 'https://developer.chrome.com/docs/extensions';
// //   const webstoreUrl = 'https://developer.chrome.com/docs/webstore';
// //   let nextState = "OFF";

// //   if (tab.url.startsWith(extensionsUrl) || tab.url.startsWith(webstoreUrl)) {
// //     const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
// //     nextState = prevState === 'ON' ? 'OFF' : 'ON';
// //     await chrome.action.setBadgeText({
// //       tabId: tab.id,
// //       text: nextState,
// //     });
// //   }
// // });

// // // Listen for messages requesting price data
// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   if (message.type === "FETCH_PRICES") {
// //     console.log("Fetching competitor prices for product:", message.data);
// //     const product = message.data;

// //     // ---- Mock Data ----
// //     // This simulates competitor prices. You can add more stores or logic here.
// //     const mockData = {
// //       results: [
// //         { store: "Amazon",    price: product.price || "$99.99", link: "https://amazon.com/dp/example" },
// //         { store: "eBay",      price: "$94.50",                  link: "https://ebay.com/itm/example" },
// //         { store: "Walmart",   price: "$95.99",                  link: "https://walmart.com/ip/example" },
// //         { store: "Best Buy",  price: "$97.50",                  link: "https://bestbuy.com/site/example" }
// //       ]
// //     };

// //     // Fake delay to mimic API call
// //     setTimeout(() => {
// //       sendResponse(mockData);
// //     }, 1500);

// //     // Must return true to indicate async response
// //     return true;
// //   }
// // });

// console.log("Service worker running");

// // On install, initialize a badge or do other setup
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({ text: "OFF" });
//   console.log("Extension installed!");
// });

// // Example of toggling the badge text on certain URLs
// chrome.action.onClicked.addListener(async (tab) => {
//   const extensionsUrl = 'https://developer.chrome.com/docs/extensions';
//   const webstoreUrl   = 'https://developer.chrome.com/docs/webstore';
//   let nextState       = "OFF";

//   if (tab.url.startsWith(extensionsUrl) || tab.url.startsWith(webstoreUrl)) {
//     const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//     nextState       = (prevState === 'ON') ? 'OFF' : 'ON';
//     await chrome.action.setBadgeText({ tabId: tab.id, text: nextState });
//   }
// });

// // Listen for messages requesting price data
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "FETCH_PRICES") {
//     const product = message.data;
//     console.log("Fetching competitor prices for product:", product);

//     // ---- Mock Data ----
//     const mockData = {
//       results: [
//         { store: "Amazon",    price: product.price || "$100.00", link: "https://amazon.com/dp/example" },
//         { store: "eBay",      price: "$94.50",                    link: "https://ebay.com/itm/example" },
//         { store: "Walmart",   price: "$97.99",                    link: "https://walmart.com/ip/example" },
//         { store: "Best Buy",  price: "$99.50",                    link: "https://bestbuy.com/site/example" }
//       ]
//     };

//     // Simulate an API delay
//     setTimeout(() => {
//       sendResponse(mockData);
//     }, 1000);

//     return true; // indicates async response
//   }
// });

console.log("Service worker running");

// On install, initialize a badge or do other setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "OFF" });
  console.log("Extension installed!");
});

// Example of toggling the badge text on certain URLs
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
