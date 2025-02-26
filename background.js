const SCRAPINGBEE_API_KEY = "P766I99FFW2U4EO9FTHELF9FM03CVN8LFVP7NJ5KHOO99AAI5IDAG9B46L3GLPOL32U5K5LE4RYZJYIJ"; // Replace with your real API key

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "FETCH_PRICES") {
        console.log("Received search query:", message.query);

        const searchQuery = encodeURIComponent(message.query);
        const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_API_KEY}&url=https://www.amazon.com/s?k=${searchQuery}`;

        console.log("Fetching data from ScrapingBee:", scrapingBeeUrl);

        try {
            const response = await fetch(scrapingBeeUrl);

            if (!response.ok) {
                console.error("API request failed:", response.status);
                sendResponse({ error: `API request failed with status ${response.status}` });
                return;
            }

            const data = await response.text();
            console.log("ScrapingBee Response Data:", data);

            if (!data || data.length < 100) {
                console.error("Empty or short response from ScrapingBee");
                sendResponse({ error: "Empty response from API" });
                return;
            }

            // Mock data (since parsing raw HTML is difficult here)
            const mockData = {
                results: [
                    { store: "Amazon", price: "$99.99", link: `https://www.amazon.com/s?k=${searchQuery}` },
                    { store: "eBay", price: "$95.99", link: `https://www.ebay.com/sch/i.html?_nkw=${searchQuery}` },
                    { store: "Best Buy", price: "$97.50", link: `https://www.bestbuy.com/site/searchpage.jsp?st=${searchQuery}` }
                ]
            };

            sendResponse(mockData);
        } catch (error) {
            console.error("Error fetching prices:", error);
            sendResponse({ error: "Network request failed" });
        }

        return true; // Keep the response channel open for async requests
    }
});
