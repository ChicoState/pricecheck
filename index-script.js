// const compareButton = document.getElementById("compare-button");

// // Check if we have product data in storage
// chrome.storage.local.get(['currentProduct'], function (result) {
//   if (result.currentProduct) {
//     // Show product info in the UI
//     const productTitle = document.createElement('div');
//     productTitle.className = 'product-title';
//     productTitle.innerHTML = `<p><strong>Detected Product:</strong> ${result.currentProduct.title || result.currentProduct.productName}</p>
//                              <p><strong>Current Price:</strong> ${result.currentProduct.price}</p>`;

//     // Insert before the compare button
//     const welcomeMessage = document.querySelector('.message-content');
//     welcomeMessage.insertBefore(productTitle, compareButton);
//   }
// });

// compareButton.addEventListener("click", () => {
//   // Show loading state
//   const resultDiv = document.getElementById("result");
//   resultDiv.innerHTML = '<div class="loading">Comparing prices...</div>';

//   // Get current product from storage or use a dummy one
//   chrome.storage.local.get(['currentProduct'], function (result) {
//     const productData = result.currentProduct || {
//       title: "Sample Product",
//       price: "$120.00",
//       productName: "Sample Product"
//     };

//     chrome.runtime.sendMessage({ type: "FETCH_PRICES", data: productData }, (response) => {
//       resultDiv.innerHTML = ""; // Clear loading message

//       // Display error if present
//       if (!response?.success) {
//         resultDiv.innerHTML = `<p class="error">Error: ${response?.message || "Could not compare prices"}</p>`;
//         return;
//       }

//       // Extract alternatives from the response
//       const alternatives = response.data.alternatives;

//       // Create visual elements for each alternative site
//       alternatives.forEach((item) => {
//         const el = document.createElement("div");
//         el.className = "result";

//         // Extract price info from notes if available
//         let priceInfo = "";
//         if (item.notes && item.notes.includes("Price:")) {
//           priceInfo = item.notes;
//         } else {
//           priceInfo = item.notes || "";
//         }

//         el.innerHTML = `
//           <strong>${item.site}</strong><br>
//           ${priceInfo}<br>
//           <a href="${item.searchUrl}" target="_blank">Check Price</a>
//         `;
//         resultDiv.appendChild(el);
//       });

//       // Add summary text
//       const summaryEl = document.createElement("p");
//       summaryEl.style.fontWeight = "bold";
//       summaryEl.style.marginTop = "15px";
//       summaryEl.innerHTML = `Search Terms: ${response.data.searchTerms}`;
//       resultDiv.appendChild(summaryEl);

//       // Update savings info with placeholder values
//       // In a real implementation, this would calculate actual savings
//       const savedEstimate = Math.floor(Math.random() * 30) + 5; // Random number between 5-35
//       document.getElementById("savings-info").textContent = `Estimated Savings: $${savedEstimate.toFixed(2)}`;
//       document.getElementById("savings-progress").value = Math.min(savedEstimate, 100);
//     });
//   });
// });

// // Add server status indicator to the UI
// function addServerStatusIndicator() {
//   const statusElement = document.createElement('div');
//   statusElement.className = 'server-status';

//   const indicator = document.createElement('div');
//   indicator.className = 'status-indicator';

//   const statusText = document.createElement('span');
//   statusText.textContent = 'Server: Checking...';

//   statusElement.appendChild(indicator);
//   statusElement.appendChild(statusText);
//   document.body.appendChild(statusElement);

//   // Check server connection
//   fetch('http://localhost:3000')
//     .then(response => {
//       if (response.ok) {
//         indicator.classList.add('connected');
//         statusText.textContent = 'Server: Connected';
//       } else {
//         statusText.textContent = 'Server: Error';
//       }
//     })
//     .catch(error => {
//       console.error('Server connection error:', error);
//       statusText.textContent = 'Server: Disconnected';
//     });
// }

// // Call this function when the page loads
// document.addEventListener('DOMContentLoaded', addServerStatusIndicator);

/*
const compareButton = document.getElementById("compare-button");

// A helper function to perform the comparison logic.
function doCompare() {
  // Show loading state
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading">Comparing prices...</div>';

  // Get current product from storage or use a dummy one
  chrome.storage.local.get(['currentProduct'], function (result) {
    const productData = result.currentProduct || {
      title: "Sample Product",
      price: "$120.00",
      productName: "Sample Product"
    };

    chrome.runtime.sendMessage({ type: "FETCH_PRICES", data: productData }, (response) => {
      resultDiv.innerHTML = ""; // Clear loading message

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
          ${priceInfo}<br>
          <a href="${item.searchUrl}" target="_blank">Check Price</a>
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
    });
  });
}

// Check if we have product data in storage, show it in the UI, and compare automatically
chrome.storage.local.get(['currentProduct'], function (result) {
  const resultDiv = document.getElementById("result");
  const welcomeMessage = document.querySelector('.message-content');

  if (!result.currentProduct) {
    // If no product data at all
    resultDiv.innerHTML = `<p class="error">No product found on this page. Try refreshing or open a product page first.</p>`;
    return;
  }

  // Show product info in the UI
  const productTitle = document.createElement('div');
  productTitle.className = 'product-title';
  productTitle.innerHTML = `<p><strong>Detected Product:</strong> ${result.currentProduct.title || result.currentProduct.productName}</p>
                           <p><strong>Current Price:</strong> ${result.currentProduct.price}</p>`;
  welcomeMessage.insertBefore(productTitle, compareButton);

  // If product name is empty or price is "Price not found", show an error
  if (!result.currentProduct.title ||
      result.currentProduct.title === "" ||
      result.currentProduct.price === "Price not found") {
    resultDiv.innerHTML = `<p class="error">No valid product detected on this page. Please open a valid product page.</p>`;
    return;
  }

  // Automatically fetch competitor prices now
  doCompare();
});

// Allow user to manually compare again if desired
compareButton.addEventListener("click", doCompare);

// Add server status indicator to the UI
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

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', addServerStatusIndicator);
*/

/*
const compareButton = document.getElementById("compare-button");

// Generate a simple key for caching results based on product name + price
function getProductKey(product) {
  const title = (product.title || product.productName || "").trim();
  const price = (product.price || "").trim();
  return `${title}||${price}`;
}

// Renders the results on the page
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
      ${priceInfo}<br>
      <a href="${item.searchUrl}" target="_blank">Check Price</a>
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

// Performs the actual price comparison API call
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
      // Cache these results so we won't re-fetch the same product
      const productKey = getProductKey(productData);
      chrome.storage.local.get(['productCache'], (store) => {
        const cache = store.productCache || {};
        cache[productKey] = data; // Save or overwrite
        chrome.storage.local.set({ productCache: cache });
      });

      displayResults(data);
    })
    .catch(error => {
      console.error("Error fetching from server:", error);
      resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    });
}

// Check if we have product data in storage, show it in the UI, then decide if we need a new call
chrome.storage.local.get(['currentProduct', 'productCache'], function (stored) {
  const resultDiv = document.getElementById("result");
  const welcomeMessage = document.querySelector('.message-content');
  const currentProduct = stored.currentProduct;

  if (!currentProduct) {
    // If no product data at all
    resultDiv.innerHTML = `<p class="error">No product found on this page. Try refreshing or open a product page first.</p>`;
    return;
  }

  // Show product info in the UI
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

  // Check the cache for this product
  const productKey = getProductKey(currentProduct);
  const cache = stored.productCache || {};
  if (cache[productKey]) {
    // We have cached results for the exact same product+price
    console.log("Already have cached results for this product, displaying them...");
    displayResults(cache[productKey]);
  } else {
    // Otherwise, fetch new competitor prices now
    doCompare(currentProduct);
  }
});

// If user manually clicks "Compare", we'll force a fresh API call
compareButton.addEventListener("click", () => {
  chrome.storage.local.get(['currentProduct'], function (data) {
    const productData = data.currentProduct;
    if (!productData) {
      document.getElementById("result").innerHTML = `<p class="error">No product found. Please open a valid product page.</p>`;
      return;
    }
    // Force a fresh compare
    doCompare(productData);
  });
});

// Add server status indicator to the UI
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
*/

/*
const compareButton = document.getElementById("compare-button");


function getProductKey(product) {
  const title = (product.title || product.productName || "").trim();
  const price = (product.price || "").trim();
  return `${title}||${price}`;
}


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
      ${priceInfo}<br>
      <a href="${item.searchUrl}" target="_blank">Check Price</a>
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

  // Check for cached results for this product
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


compareButton.addEventListener("click", () => {
  chrome.storage.local.get(['currentProduct'], function (data) {
    if (!data.currentProduct) {
      document.getElementById("result").innerHTML = `<p class="error">No product found. Please open a valid product page.</p>`;
      return;
    }
    doCompare(data.currentProduct);
  });
});

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
*/

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
 * Uses data.BestDeals to display product information obtained from each site
 */
function displayResults(data) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  const bestDeals = data.bestDeals || [];

  if (bestDeals.length === 0) {
    resultDiv.innerHTML = '<p>No deals found.</p>';
    return;
  }

  bestDeals.forEach((deal) => {
    const el = document.createElement("div");
    el.className = "result";

    el.innerHTML = `
      <p><strong>${deal.website}</strong></p>
      <p>Product found: ${deal.title}</p>
      <p>Price: $${deal.price}</p>
      <a href="${deal.url}" target="_blank" class="button-link">View Product</a>
    `;
    resultDiv.appendChild(el);
  });

  
  const summaryEl = document.createElement("p");
  summaryEl.style.fontWeight = "bold";
  summaryEl.style.marginTop = "15px";
  summaryEl.innerHTML = `Search Terms: ${data.searchTerms}`;
  resultDiv.appendChild(summaryEl);

  
  const savedEstimate = Math.floor(Math.random() * 46) + 5;
  const savingsInfo = document.getElementById("savings-info");
if (savingsInfo) {
  savingsInfo.textContent = `Estimated Savings: $${savedEstimate.toFixed(2)}`;
}

const savingsProgress = document.getElementById("savings-progress");
if (savingsProgress) {
  savingsProgress.value = Math.min(savedEstimate, 100);
}

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
      // Cache the result
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
