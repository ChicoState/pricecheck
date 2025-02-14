// console.log("Service worker running");

// chrome.runtime.onInstalled.addListener(() => {
//     chrome.action.setBadgeText({ text: "OFF" });
//     console.log("Extension installed!"); 
// });

// const extensions = 'https://developer.chrome.com/docs/extensions';
// const webstore = 'https://developer.chrome.com/docs/webstore';

// chrome.action.onClicked.addListener(async (tab) => {
//     let nextState = "OFF"; // Declare and initialize here!  Important!

//     if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
//       const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//       nextState = prevState === 'ON' ? 'OFF' : 'ON'; // Now assign the correct value
//       await chrome.action.setBadgeText({
//         tabId: tab.id,
//         text: nextState,
//       });
//     } 

// });

console.log("Service worker running");

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "OFF" });
  console.log("Extension installed!");
});

chrome.action.onClicked.addListener(async (tab) => {
  const extensionsUrl = 'https://developer.chrome.com/docs/extensions';
  const webstoreUrl = 'https://developer.chrome.com/docs/webstore';
  let nextState = "OFF";

  if (tab.url.startsWith(extensionsUrl) || tab.url.startsWith(webstoreUrl)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    nextState = prevState === 'ON' ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PRICES") {
    console.log("Fetching competitor prices for product:", message.data);
    const product = message.data;

    const mockData = {
      results: [
        { store: "Amazon", price: product.price || "$99.99", link: "https://amazon.com/dp/example" },
        { store: "Walmart", price: "$95.99", link: "https://walmart.com/ip/example" },
        { store: "Best Buy", price: "$97.50", link: "https://bestbuy.com/site/example" }
      ]
    };

    setTimeout(() => {
      sendResponse(mockData);
    }, 1500);

    return true;
  }
});
