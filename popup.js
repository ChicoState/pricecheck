document.addEventListener("DOMContentLoaded", function () {
  //Dark Mode
  const darkModeButton = document.getElementById("darkmodebutton");

  chrome.storage.sync.get("darkMode", function (data) {
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
    }
  });

  darkModeButton?.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark-mode");
    chrome.storage.sync.set({ darkMode: isDark });
  });

  //Tabs
  const compareTab = document.getElementById("compare-tab");
  const historyTab = document.getElementById("history-tab");
  const compareView = document.getElementById("compare-view");
  const historyView = document.getElementById("history-view");

  compareTab?.addEventListener("click", () => {
    compareTab.classList.add("active");
    historyTab.classList.remove("active");
    compareView.style.display = "block";
    historyView.style.display = "none";
  });

  historyTab?.addEventListener("click", () => {
    historyTab.classList.add("active");
    compareTab.classList.remove("active");
    compareView.style.display = "none";
    historyView.style.display = "block";
    loadHistory();
  });

  //Compare Prices: Extract title only
  const compareButton = document.getElementById("compare-button");
  compareButton?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const title = document.getElementById("productTitle")?.innerText?.trim();
            return {
              title: title || "Unknown Product",
              url: window.location.href,
              timestamp: new Date().toLocaleString()
            };
          }
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            addToHistory(results[0].result);
          }
        }
      );
    });
  });
});


function loadHistory() {
  const historyDiv = document.getElementById("history");
  if (!historyDiv) return;

  historyDiv.innerHTML = "";

  chrome.storage.local.get(["productHistory"], (result) => {
    const history = result.productHistory || [];

    if (history.length === 0) {
      historyDiv.innerHTML = "<p>No recent products found.</p>";
      return;
    }

    history.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "history-item";

      // Text content
      itemDiv.innerHTML = `
        <strong>${item.title}</strong><br>
        Viewed: ${item.timestamp}<br>
      `;

      // ✅ Create working button
      const viewButton = document.createElement("button");
      viewButton.textContent = "View Product";
      viewButton.className = "button-link";
      viewButton.addEventListener("click", () => {
        chrome.tabs.create({ url: item.url });
      });

      // ✅ Append elements in correct order
      itemDiv.appendChild(viewButton);

      const hr = document.createElement("hr");
      itemDiv.appendChild(hr);

      historyDiv.appendChild(itemDiv);
    });
  });
}

// Save Product to History
function addToHistory(product) {
  chrome.storage.local.get(["productHistory"], (res) => {
    let history = res.productHistory || [];

    history = history.filter((item) => item.url !== product.url);
    product.timestamp = new Date().toLocaleString();
    history.unshift(product);
    if (history.length > 10) history = history.slice(0, 10);
    chrome.storage.local.set({ productHistory: history });
  });
}
