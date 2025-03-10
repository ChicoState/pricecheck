const compareButton = document.getElementById("compare-button");

compareButton.addEventListener("click", () => {
  const productData = { title: "Sample Product", price: "$120.00" };

  chrome.runtime.sendMessage({ type: "FETCH_PRICES", data: productData }, (response) => {
    const resultDiv = document.getElementById("result");
    
    // Get the dedicated Amazon container and hide it initially.
    const amazonContainer = document.getElementById("amazon-result");
    amazonContainer.style.display = "none";
    
    // Clear any existing generic results while keeping the Amazon container.
    resultDiv.innerHTML = "";
    resultDiv.appendChild(amazonContainer);

    // Display error if present.
    if (response?.error) {
      resultDiv.innerHTML = `<p class="error">Error: ${response.error}</p>`;
      return;
    }

    // Determine the cheapest price.
    let cheapest = null;
    response.results.forEach((item) => {
      const itemPriceNum = parseFloat(item.price.replace(/[$,]/g, ""));
      if (!cheapest || itemPriceNum < parseFloat(cheapest.price.replace(/[$,]/g, ""))) {
        cheapest = item;
      }
    });

    // Process each result.
    response.results.forEach((item) => {
      if (item.store.toLowerCase() === "amazon") {
        // Update the Amazon container and unhide it.
        amazonContainer.style.display = "inline-block"; // or "block"
        amazonContainer.innerHTML = `
          <strong>${item.store}</strong><br>
          Price: ${item.price}<br>
          <a href="${item.link}" target="_blank">Link</a>
        `;
      } else {
        // Create a generic result box.
        const el = document.createElement("div");
        el.className = "result";
        el.innerHTML = `
          <strong>${item.store}</strong><br>
          Price: ${item.price}<br>
          <a href="${item.link}" target="_blank">Link</a>
        `;
        resultDiv.appendChild(el);
      }
    });

    // Highlight the cheapest option.
    if (cheapest) {
      const cheapestEl = document.createElement("p");
      cheapestEl.style.fontWeight = "bold";
      cheapestEl.innerHTML = `Cheapest Store: ${cheapest.store} at ${cheapest.price}`;
      resultDiv.appendChild(cheapestEl);
    }

    // Update savings info.
    const userPriceNum = parseFloat(productData.price.replace(/[$,]/g, ""));
    const cheapestNum  = parseFloat(cheapest.price.replace(/[$,]/g, ""));
    const saved        = (userPriceNum - cheapestNum).toFixed(2);
    document.getElementById("savings-info").textContent = `Total Saved: $${saved}`;
    document.getElementById("savings-progress").value = Math.min(saved, 100);
  });
});

// last updated code
// const compareButton = document.getElementById("compare-button");
// compareButton.addEventListener("click", () => {
//   const productData = { title: "Sample Product", price: "$120.00" };
//   chrome.runtime.sendMessage(
//     { type: "FETCH_PRICES", data: productData },
//     (response) => {
//       const resultDiv = document.getElementById("result");
//       resultDiv.innerHTML = "";

//       // Display error if present.
//       if (response?.error) {
//         resultDiv.innerHTML = `<p class="error">Error: ${response.error}</p>`;
//         return;
//       }

//       // Determine the cheapest price.
//       let cheapest = null;
//       response.results.forEach((item) => {
//         const itemPriceNum = parseFloat(item.price.replace(/[$,]/g, ""));
//         if (!cheapest || itemPriceNum < parseFloat(cheapest.price.replace(/[$,]/g, ""))) {
//           cheapest = item;
//         }
//       });

//       // Display each store's price.
//       response.results.forEach((item) => {
//         const el = document.createElement("div");
//         el.className = "result";
//         el.innerHTML = `
//           <strong>${item.store}</strong><br>
//           Price: ${item.price}<br>
//           <a href="${item.link}" target="_blank">Link</a>
//         `;
//         resultDiv.appendChild(el);
//       });

//       // Highlight the cheapest option.
//       if (cheapest) {
//         const cheapestEl = document.createElement("p");
//         cheapestEl.style.fontWeight = "bold";
//         cheapestEl.innerHTML = `Cheapest Store: ${cheapest.store} at ${cheapest.price}`;
//         resultDiv.appendChild(cheapestEl);
//       }

//       // Update savings info.
//       const userPriceNum = parseFloat(productData.price.replace(/[$,]/g, ""));
//       const cheapestNum  = parseFloat(cheapest.price.replace(/[$,]/g, ""));
//       const saved        = (userPriceNum - cheapestNum).toFixed(2);
//       document.getElementById("savings-info").textContent = `Total Saved: $${saved}`;
//       document.getElementById("savings-progress").value = Math.min(saved, 100);
//     }
//   );
// });
