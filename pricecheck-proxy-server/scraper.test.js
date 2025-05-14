const { scrapeAmazon, scrapeEbay, scrapeBestBuy } = require('./scrape-price.js'); 
jest.setTimeout(20000); 

describe('Ebay test', () => {

    test('scrapeEbay should return lowest price for "usb c cable"', async () => {
        const url = 'https://www.ebay.com/sch/i.html?_nkw=usb+c+cable';
        const result = await scrapeEbay(url);
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
      });

      test('scrapeEbay should return lowest price for "apple iphone 13 "', async () => {
        
        const url = 'https://www.ebay.com/sch/i.html?_nkw=apple+iphone+13+&_sacat=0&_from=R40&_trksid=p2334524.m570.l1313&_odkw=apple+iphone+13+128gb+unlocked&_osacat=0&_sop=12';
        const result = await scrapeEbay(url);
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
       console.log('eBay result:', result);
      });


      test('scrapeEbay should return lowest price for " Macbook"', async () => {
        
        const url = 'https://www.ebay.com/sch/i.html?_nkw=macbook+pro+m1&_sacat=175672&_from=R40&_trksid=p2334524.m570.l2632&_odkw=macbook+pro&_osacat=0&_sop=12';
        const result = await scrapeEbay(url);
        expect(result).toHaveProperty('price');
        console.log('eBay result:', result);
        expect(typeof result.price).toBe('number');
       console.log('eBay result:', result);
      });

});



describe('Amazon test', () => {


    test('scrapeAmazon should return lowest price for "iphone 13 128gb midnight unlocked"', async () => {
        const url = 'https://www.amazon.com/s?k=Apple+iPhone+13%2C+128GB%2C+Midnight+-+Unlocked+%28Renewed%29&crid=26YIUOTTYTBPA&sprefix=apple+iphone+13%2C+128gb%2C+midnight+-+unlocked+renewed+%2Caps%2C338&ref=nb_sb_noss_2';
        const result = await scrapeAmazon(url, 'Apple iPhone 13');
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
        expect(result.price).toBe(274.95);
      });


      test('scrapeAmazon should return lowest price for "Playstation 4', async () => {
        const url = 'https://www.amazon.com/s?k=Sony+PlayStation+4+Console%2C+Renewed%2C+Black&crid=1I6WJ3CGNVGHS&sprefix=sony+playstation+4+console%2C+renewed%2C+black%2Caps%2C329&ref=nb_sb_noss_2';
        const result = await scrapeAmazon(url, 'Sony PlayStation 4');
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
        console.log('Amazon result:', result);
       expect(result.price).toBe(169.99);
      });



});


describe('BestBuy test', () => {

    test('scrapeBestBuy should return lowest price for "usb c cable"', async () => {
        const url = 'https://www.bestbuy.com/site/searchpage.jsp?st=usb+c+cable';
        const result = await scrapeBestBuy(url);
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
        console.log('BestBuy result:', result);
        expect(result.price).toBe(13.99);
    });



    test('scrapeBestBuy should return lowest price for "iphone 13 128gb midnight unlocked"', async () => {
        const url = 'https://www.bestbuy.com/site/searchpage.jsp?st=iphone+13+128gb+midnight+unlocked&id=pcat17071';
        const result = await scrapeBestBuy(url);
        expect(result).toHaveProperty('price');
        expect(typeof result.price).toBe('number');
        console.log('BestBuy result:', result);
        expect(result.price).toBe(359.99);
    });




});