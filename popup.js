document.addEventListener("DOMContentLoaded", function () {
  const checkPriceButton = document.getElementById("checkPrice");
  const resultDiv = document.getElementById("result");

  checkPriceButton.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          let currentTab = tabs[0];
          console.log("Current Tab URL:", currentTab.url); // Debug log for URL

          // Check if the URL is from supported websites (Amazon, eBay, Best Buy)
          if (currentTab && (currentTab.url.includes("amazon.com") || 
                             currentTab.url.includes("ebay.com") || 
                             currentTab.url.includes("bestbuy.com"))) {
              
              // Execute script to extract product data
              chrome.scripting.executeScript({
                  target: { tabId: currentTab.id },
                  function: extractProductData
              }, (results) => {
                  if (chrome.runtime.lastError) {
                      console.error("Error in price check:", chrome.runtime.lastError);
                      resultDiv.textContent = "Failed to fetch prices. Try again.";
                  } else {
                      console.log("Product data:", results);
                      if (results && results[0] && results[0].result) {
                          resultDiv.textContent = `Title: ${results[0].result.title}, Price: ${results[0].result.price}`;
                      } else {
                          resultDiv.textContent = "No product data found.";
                      }
                  }
              });
          } else {
              console.error("Invalid tab. Make sure you're on a supported website.");
              resultDiv.textContent = "Please visit a supported website like Amazon, eBay, or Best Buy.";
          }
      });
  });
});

// Function to extract product data from the webpage
function extractProductData() {
    let title = "";
    let price = "";
    
    title = document.querySelector("#productTitle")?.textContent.trim();
    price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice")?.textContent.trim();
    
    if (!title) {
      title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
    }
    if (!price) {
      price = document.querySelector("span.price-characteristic")?.textContent.trim();
    }
    
    if (!title) {
      title = document.title;
    }
    
    return { title, price };
}
