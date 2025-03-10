// // Extract product info from the current page (Amazon, Walmart, eBay, etc.)
// function extractProductData() {
//   let title = "";
//   let price = "";

//   // Try typical Amazon selectors
//   title = document.querySelector("#productTitle")?.textContent.trim();
//   price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice")?.textContent.trim();

//   // If not on Amazon, try Walmart
//   if (!title) {
//     title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
//   }
//   if (!price) {
//     price = document.querySelector("span.price-characteristic")?.textContent.trim();
//   }

//   // If still not found, fallback to page title
//   if (!title) {
//     title = document.title;
//   }

//   return { title, price };
// }

// // Immediately send the extracted product data to the extension
// const productData = extractProductData();
// chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });
// Enhanced product data extraction using more selectors

function extractProductData() {
  let title = "";
  let price = "";

  // Common selectors for Amazon
  title = document.querySelector("#productTitle")?.textContent.trim();
  price = document.querySelector("#priceblock_ourprice, #priceblock_dealprice")?.textContent.trim();

  // Walmart selectors
  if (!title) {
    title = document.querySelector("h1.prod-ProductTitle")?.textContent.trim();
  }
  if (!price) {
    price = document.querySelector("span.price-characteristic")?.textContent.trim();
  }

  // eBay selectors
  if (!title) {
    title = document.querySelector("#itemTitle")?.textContent.replace("Details about  \xa0", "").trim();
  }
  if (!price) {
    price = document.querySelector("#prcIsum, #mm-saleDscPrc")?.textContent.trim();
  }

  // Fallback: Use document title if product title not found
  if (!title) {
    title = document.title;
  }

  return { title, price };
}

// Automatically send the extracted product data to the extension
const productData = extractProductData();
chrome.runtime.sendMessage({ type: "PRODUCT_DATA", data: productData });
