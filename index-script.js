const compareButton = document.getElementById("compare-button");

/**
 * Generate a key for caching results based on product name + price.
 * Domain is omitted, so if the user visits a different tab/domain
 * that has the same product name & price, we'll reuse cached results.
 */
function getProductKey(product) {
  const title = (product.title || product.productName || "").trim();
  const price = (product.price || "").trim();
  return `${title}||${price}`;
}

/**
 * Renders the results on the page.
 */
function displayResults(response) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // Clear existing content

  // Display error if present
  if (!response?.success) {
    resultDiv.innerHTML = `<p class="error">Error: ${response?.message || "Could not compare prices"}</p>`;
    return;
  }

  // Extract alternatives from the response
  const alternatives = response.data.alternatives;

  // Create visual elements for each alternative site
  alternatives.forEach((item) => {
    const el = document.createElement("div");
    el.className = "result";

    // Extract price info from notes if available
    let priceInfo = "";
    if (item.notes && item.notes.includes("Price:")) {
      priceInfo = item.notes;
    } else {
      priceInfo = item.notes || "";
    }

    el.innerHTML = `
      <strong>${item.site}</strong><br>
      ${priceInfo}<br><br>
      <a href="${item.searchUrl}" target="_blank" class="button-link">Check Price</a>
    `;
    resultDiv.appendChild(el);
  });

  // Add summary text
  const summaryEl = document.createElement("p");
  summaryEl.style.fontWeight = "bold";
  summaryEl.style.marginTop = "15px";
  summaryEl.innerHTML = `Search Terms: ${response.data.searchTerms}`;
  resultDiv.appendChild(summaryEl);

  // Update savings info with a random estimated savings between $5–$50
  const savedEstimate = Math.floor(Math.random() * 46) + 5; // 5–50
  document.getElementById("savings-info").textContent = `Estimated Savings: $${savedEstimate.toFixed(2)}`;
  document.getElementById("savings-progress").value = Math.min(savedEstimate, 100);
}

/**
 * Makes a fresh API call via your proxy server, then caches the results.
 */
function doCompare(productData) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading">Comparing prices...</div>';

  fetch('http://localhost:3000/api/analyze-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productInfo: {
        productName: productData.title || productData.productName || "Unknown Product",
        price: productData.price || "Unknown price",
        domain: productData.domain || window.location?.hostname || "current site"
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
      // Cache the fresh result
      const productKey = getProductKey(productData);
      chrome.storage.local.get(['productCache'], (store) => {
        const cache = store.productCache || {};
        cache[productKey] = data;
        chrome.storage.local.set({ productCache: cache });
      });

      displayResults(data);
    })
    .catch(error => {
      console.error("Error fetching from server:", error);
      resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    });
}

/**
 * Main logic for the popup:
 * - Read "currentProduct" from storage
 * - Show the product info
 * - If we have cached results (by "title||price"), display them
 * - Otherwise, fetch fresh data
 */
chrome.storage.local.get(['currentProduct', 'productCache'], function (stored) {
  const resultDiv = document.getElementById("result");
  const welcomeMessage = document.querySelector('.message-content');
  const currentProduct = stored.currentProduct;

  if (!currentProduct) {
    // If no product data at all
    resultDiv.innerHTML = `<p class="error">No product found on this page. Try refreshing or open a product page first.</p>`;
    return;
  }

  // Insert product info in UI
  const productTitle = document.createElement('div');
  productTitle.className = 'product-title';
  productTitle.innerHTML = `<p><strong>Detected Product:</strong> ${currentProduct.title || currentProduct.productName}</p>
                           <p><strong>Current Price:</strong> ${currentProduct.price}</p>`;
  welcomeMessage.insertBefore(productTitle, compareButton);

  // If product name is empty or price is "Price not found", show an error
  if (!currentProduct.title ||
      currentProduct.title === "" ||
      currentProduct.price === "Price not found") {
    resultDiv.innerHTML = `<p class="error">No valid product detected on this page. Please open a valid product page.</p>`;
    return;
  }

  // Check for cached results
  const productKey = getProductKey(currentProduct);
  const cache = stored.productCache || {};

  if (cache[productKey]) {
    console.log("Displaying cached results for this product...");
    displayResults(cache[productKey]);
  } else {
    console.log("No cache found for this product. Calling API...");
    doCompare(currentProduct);
  }
});

/**
 * "Compare Prices" button forces a fresh API call and updates the cache.
 */
compareButton.addEventListener("click", () => {
  chrome.storage.local.get(['currentProduct'], function (data) {
    if (!data.currentProduct) {
      document.getElementById("result").innerHTML = `<p class="error">No product found. Please open a valid product page.</p>`;
      return;
    }
    doCompare(data.currentProduct);
  });
});

/**
 * Adds a server status indicator at bottom-right corner on load
 */
function addServerStatusIndicator() {
  const statusElement = document.createElement('div');
  statusElement.className = 'server-status';

  const indicator = document.createElement('div');
  indicator.className = 'status-indicator';

  const statusText = document.createElement('span');
  statusText.textContent = 'Server: Checking...';

  statusElement.appendChild(indicator);
  statusElement.appendChild(statusText);
  document.body.appendChild(statusElement);

  // Check server connection
  fetch('http://localhost:3000')
    .then(response => {
      if (response.ok) {
        indicator.classList.add('connected');
        statusText.textContent = 'Server: Connected';
      } else {
        statusText.textContent = 'Server: Error';
      }
    })
    .catch(error => {
      console.error('Server connection error:', error);
      statusText.textContent = 'Server: Disconnected';
    });
}

// Run this on load
document.addEventListener('DOMContentLoaded', addServerStatusIndicator);
