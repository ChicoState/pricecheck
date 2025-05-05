const axios = require('axios');
const cheerio = require('cheerio');


async function scrapeAmazon(searchUrl, keyword,retries = 3) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    };
    console.log(`Keyword: ${keyword}`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(searchUrl, { headers });
            console.log(`Attempt ${attempt} - Status Code: ${response.status}`);
            const website ="Amazon";

            const $ = cheerio.load(response.data);
            const results = $('div.s-main-slot div[data-component-type="s-search-result"]');

            let lowestPriceProduct = null;
            let lowestPrice = Infinity; // Start with a very high price to ensure any valid price will be lower

            for (let i = 0; i < results.length; i++) {
                const result = results.eq(i);

                // Skip sponsored items
                if (result.find('.puis-sponsored-label-text').length > 0) continue;
               
                const titleElement = result.find('div[data-cy="title-recipe"] h2 span').first();
                const urlElement = result.find('div[data-cy="title-recipe"] a').first();
                const priceElement = result.find('span.a-price span.a-offscreen').first();

                const title = titleElement.text().trim();
                const relativeUrl = urlElement.attr('href');
                const fullUrl = relativeUrl ? `https://www.amazon.com${relativeUrl}` : null;
                const priceText = priceElement.text().trim();
                const price = priceText ? parseFloat(priceText.replace('$', '').replace(',', '')) : null;
                
                if (title && title.includes(keyword)) {
               

                if (title && fullUrl && price !== null && price < lowestPrice) {
                    lowestPriceProduct = {
                        title,
                        url: fullUrl,
                        price,
                        website
                    };
                    lowestPrice = price; // Update the lowest price
                }
            }
            }

            return lowestPriceProduct ? lowestPriceProduct : 'No non-sponsored product with a valid price found.';

        } catch (err) {
            if (err.response && err.response.status === 503) {
                console.warn('503 Service Unavailable — Retrying...');
                await new Promise(res => setTimeout(res, 3000)); // Wait 3 seconds before retry
            } else {
                console.error(`❌ Failed to fetch page on attempt ${attempt}:`, err.message);
                break;
            }
        }
    }

    return 'Failed to fetch page after all attempts.';
}





async function scrapeEbay(searchUrl,retries = 3) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    };
   console.log(`scraping ebay`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(searchUrl, { headers });
            console.log(`Attempt ${attempt} - Status Code: ${response.status}`);

            const $ = cheerio.load(response.data);
            const results = $('li.s-item');
            const website ="eBay";
          

            let lowestPriceProduct = null;
            let lowestPrice = Infinity; 
            
            for (let i = 0; i < results.length; i++) {
                const result = results.eq(i);

               
                const titleElement = result.find('div.s-item__title span[role="heading"]').first();
                const urlElement = result.find('a.s-item__link').first();
                const priceElement = result.find('span.s-item__price').first();

                const title = titleElement.text().trim();
                const relativeUrl = urlElement.attr('href');
                const fullUrl = relativeUrl ? `${relativeUrl}` : null;
                const priceText = priceElement.text().trim();
                const price = priceText ? parseFloat(priceText.replace('$', '').replace(',', '')) : null;
               
              

                if(title!== 'Shop on eBay'){
                if (title && fullUrl && price !== null && price < lowestPrice) {
                    lowestPriceProduct = {
                        title,
                        url: fullUrl,
                        price,
                        website

                    };
                    lowestPrice = price; // Update the lowest price
                }
            }
            
            }

            return lowestPriceProduct ? lowestPriceProduct : 'No non-sponsored product with a valid price found.';

        } catch (err) {
            if (err.response && err.response.status === 503) {
                console.warn('503 Service Unavailable — Retrying...');
                await new Promise(res => setTimeout(res, 3000)); // Wait 3 seconds before retry
            } else {
                console.error(`❌ Failed to fetch page on attempt ${attempt}:`, err.message);
                break;
            }
        }
    }

    return 'Failed to fetch page after all attempts.';
}




    const puppeteer = require('puppeteer');

    async function scrapeBestBuy(searchUrl) {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        website="BestBuy";
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');

        console.log(`Navigating to ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 0 });

        const products = await page.$$eval('li.product-list-item', items => {
            return items.map(item => {
                const title = item.querySelector('img[data-testid="product-image"]')?.alt?.trim() || null;

               console.log(title);
                const url = item.querySelector('a.product-list-item-link')?.href || null;
                const priceText = item.querySelector('div.customer-price')?.textContent?.trim() || null;
                const price = priceText ? parseFloat(priceText.replace('$', '').replace(',', '')) : null;

                return { title, url, price,  website: "BestBuy" };
            });
        });

 


        await browser.close();
     
        const validProducts = products.filter(p => p.title && p.url && p.price !== null);
        const lowest = validProducts.reduce((lowest, current) => current.price < lowest.price ? current : lowest, { price: Infinity });
        console.log("bestbuy test");
        console.log(lowest);
        return lowest.price !== Infinity ? lowest : 'No valid products found.';
    }

    
  
    


module.exports = {
    scrapeAmazon,
    scrapeEbay,
    scrapeBestBuy
};
