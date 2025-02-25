// console.log("This is a popup!");

// document.getElementById("checkPrice").addEventListener("click", () => {
//   console.log("Price check initiated.");
// });

console.log("Popup loaded.");

document.getElementById("button").addEventListener("click", async () => {
  document.getElementById("result").innerHTML = '<p class="loading">Checking prices...</p>';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error("No active tab found.");
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-price.js']
    });
    
    chrome.runtime.onMessage.addListener(function handler(message, sender, sendResponse) {
      if (message.type === "PRODUCT_DATA") {
        console.log("Product data received: ", message.data);
        chrome.runtime.onMessage.removeListener(handler);
        chrome.runtime.sendMessage({ type: "FETCH_PRICES", data: message.data }, (response) => {
          document.getElementById("result").innerHTML = formatResult(response);
        });
      }
    });
  } catch (error) {
    console.error("Error in price check: ", error);
    document.getElementById("result").textContent = "Error checking price. See console for details.";
  }
});

function formatResult(data) {
  if (!data || !data.results || data.results.length === 0) {
    return "<p>No price data found.</p>";
  }
  let html = "<h2>Price Comparison</h2>";
  data.results.forEach(item => {
    html += `<div class="result">
      <strong>${item.store}</strong><br>
      Price: ${item.price}<br>
      <a href="${item.link}" target="_blank">View Product</a>
    </div>`;
  });
  return html;
}
