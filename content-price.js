// content-price.js
// This script extracts product information from the webpage.

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
  
  const productData = extractProductData();
  chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });
  