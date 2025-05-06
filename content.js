// Example content script that processes <article> content
const article = document.querySelector("article");
if (article) {
  const text = article.textContent;
  const wordCount = (text.match(/[^\s]+/g) || []).length;
  const readingTime = Math.round(wordCount / 200);

  const badge = document.createElement("p");
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  const heading = article.querySelector("h1");
  const date = article.querySelector("time")?.parentNode;
  (date ?? heading)?.insertAdjacentElement("afterend", badge);
}

// Create the floating "Check Price" button
const button = document.createElement('button');
button.innerText = '🔍 Check Prices';
button.style.position = 'fixed';
button.style.bottom = '20px';
button.style.right = '20px';
button.style.padding = '10px 20px';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.zIndex = '10000';
button.style.cursor = 'pointer';
button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
document.body.appendChild(button);

// When the floating button is clicked
button.addEventListener('click', async () => {
    console.log('Floating button clicked');
    try {
        await chrome.runtime.sendMessage({ action: "openPopup" });
    } catch (error) {
        console.error('Error sending openPopup message:', error);
    }
});