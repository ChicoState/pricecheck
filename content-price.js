// // content-price.js
// // This script extracts product information from the webpage.

// function extractProductData() {
//   let title = "";
//   let price = "";
  
//   // Try Amazon selectors first
//   title = document.querySelector("#productTitle")?.textContent.trim();
//   price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice")?.textContent.trim();

//   // If not Amazon, try Walmart
//   if (!title) {
//     title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
//   }
//   if (!price) {
//     price = document.querySelector("span.price-characteristic")?.textContent.trim();
//   }

//   // If still not found, fall back to page title
//   if (!title) {
//     title = document.title;
//   }

//   return { title, price };
// }

// // Immediately extract data and send it to the background script
// const productData = extractProductData();
// chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });

// Extract product info from the current page (Amazon, Walmart, eBay, etc.)
function extractProductData() {
  let title = "";
  let price = "";

  // Try typical Amazon selectors
  title = document.querySelector("#productTitle")?.textContent.trim();
  price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice")?.textContent.trim();

  // If not on Amazon, try Walmart
  if (!title) {
    title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
  }
  if (!price) {
    price = document.querySelector("span.price-characteristic")?.textContent.trim();
  }

  // If still not found, fallback to page title
  if (!title) {
    title = document.title;
  }

  return { title, price };
}

// Immediately send the extracted product data to the extension
const productData = extractProductData();
chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });

