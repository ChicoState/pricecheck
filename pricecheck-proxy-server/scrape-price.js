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
                console.log(`Amazon Product #${i + 1} ---`);
                console.log(`Title: ${title}`);
                console.log(`URL: ${fullUrl}`);
                console.log(`Price: ${priceText}\n`);

                if (title && fullUrl && price !== null && price < lowestPrice) {
                    lowestPriceProduct = {
                        title,
                        url: fullUrl,
                        price
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

// Example usage
//scrapeAmazon('https://www.amazon.com/s?k=iphone+13+128GB+Midnight+Unlocked', 'iPhone 13')
 //.then(result => console.log('✅ Final Result:', result))
   // .catch(err => console.error('Error during scrapeAmazon:', err));



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

           //    const results = $('ul.srp-results');

            let lowestPriceProduct = null;
            let lowestPrice = Infinity; // Start with a very high price to ensure any valid price will be lower

            for (let i = 0; i < results.length; i++) {
                const result = results.eq(i);

                // Skip sponsored items
               // if (result.find('.puis-sponsored-label-text').length > 0) continue;
               
                const titleElement = result.find('div.s-item__title span[role="heading"]').first();
                const urlElement = result.find('a.s-item__link').first();
                const priceElement = result.find('span.s-item__price').first();

                const title = titleElement.text().trim();
                const relativeUrl = urlElement.attr('href');
                const fullUrl = relativeUrl ? `${relativeUrl}` : null;
                const priceText = priceElement.text().trim();
                const price = priceText ? parseFloat(priceText.replace('$', '').replace(',', '')) : null;
                
                console.log(`Ebay Product #${i + 1} ---`);
                console.log(`Title: ${title}`);
                console.log(`URL: ${fullUrl}`);
                console.log(`Price: ${priceText}\n`);

                if(title!== 'Shop on eBay'){
                if (title && fullUrl && price !== null && price < lowestPrice) {
                    lowestPriceProduct = {
                        title,
                        url: fullUrl,
                        price
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


// Example usage
//scrapeEbay('https://www.ebay.com/sch/i.html?_nkw=apple+iphone+13+128gb+unlocked&_sacat=0&_from=R40&_trksid=p2334524.m570.l1311&_odkw=iphone+13&_osacat=0&_sop=12')
  //.then(result => console.log('✅ Final Result:', result))
    //.catch(err => console.error('Error during scrapeAmazon:', err));

    const puppeteer = require('puppeteer');

    async function scrapeBestBuy(searchUrl) {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
    
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');
    
        console.log(`Navigating to ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 0 });
    
        const products = await page.$$eval('li.sku-item', items => {
            return items.map(item => {
                const title = item.querySelector('h4.sku-title a')?.textContent?.trim() || null;
                const url = item.querySelector('h4.sku-title a')?.href || null;
                const priceText = item.querySelector('div.priceView-hero-price span')?.textContent?.trim() || null;
                const price = priceText ? parseFloat(priceText.replace('$', '').replace(',', '')) : null;
               
                return { title, url, price };
            });
        });

        for (const product of products) {
            
            console.log(`BestBuy Title: ${product.title}`);
            console.log(`BestBuy URL: ${product.url}`);
            console.log(`BestBuy Price: ${product.price}\n`);
        }
        
    
        await browser.close();
       // console.log(products);
        const validProducts = products.filter(p => p.title && p.url && p.price !== null);
        const lowest = validProducts.reduce((lowest, current) => current.price < lowest.price ? current : lowest, { price: Infinity });
    
        return lowest.price !== Infinity ? lowest : 'No valid products found.';
    }
    
   // scrapeBestBuy('https://www.bestbuy.com/site/searchpage.jsp?st=iphone+13+128gb+midnight+unlocked')
     //   .then(result => console.log('✅ Final Result:', result))
       // .catch(err => console.error('❌ Error:', err));
    


module.exports = {
    scrapeAmazon,
    scrapeEbay,
    scrapeBestBuy
};
