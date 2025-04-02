const compareButton = document.getElementById("compare-button");

// Check if we have product data in storage
chrome.storage.local.get(['currentProduct'], function (result) {
  if (result.currentProduct) {
    // Show product info in the UI
    const productTitle = document.createElement('div');
    productTitle.className = 'product-title';
    productTitle.innerHTML = `<p><strong>Detected Product:</strong> ${result.currentProduct.title || result.currentProduct.productName}</p>
                             <p><strong>Current Price:</strong> ${result.currentProduct.price}</p>`;

    // Insert before the compare button
    const welcomeMessage = document.querySelector('.message-content');
    welcomeMessage.insertBefore(productTitle, compareButton);
  }
});

compareButton.addEventListener("click", () => {
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

      // Update savings info with placeholder values
      // In a real implementation, this would calculate actual savings
      const savedEstimate = Math.floor(Math.random() * 30) + 5; // Random number between 5-35
      document.getElementById("savings-info").textContent = `Estimated Savings: $${savedEstimate.toFixed(2)}`;
      document.getElementById("savings-progress").value = Math.min(savedEstimate, 100);
    });
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

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', addServerStatusIndicator);