const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;
const { scrapeAmazon, scrapeEbay, scrapeBestBuy } = require('./scrape-price');


// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const useClaude=true;
if (useClaude){

if (!ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY is not set in environment variables');
    process.exit(1);
}

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/', (req, res) => {
    res.send('PriceCheck API Proxy Server is running');
});

function constructProductAnalysisPrompt(productInfo) {
    const productNameSafe = productInfo.productName || 'Unknown Product';
    const priceSafe = productInfo.price || 'Unknown Price';
    const domainSafe = productInfo.domain || 'Unknown Website';

    return `
      I'm looking at a product: "${productNameSafe}" with a price of ${priceSafe} on ${domainSafe}.

        Please perform the following steps:
        1. Identify 3–6 key search terms for this product.
        2. Suggest 3–5 alternative websites where I might find it cheaper.
        3. For each website, provide:
        - "site": website name
        - "searchUrl": a full URL to search for this product
        - "notes": any helpful pricing info or tips

      Only include Amazon, eBay, or Best Buy in your suggestions.

      Format your response as JSON with this structure:
      {
        "searchTerms": "key search terms",
        "alternatives": [
          {
            "site": "website name",
            "searchUrl": "full URL to search for this product",
            "notes": "any price info or tips"
          },
          ...more alternatives...
        ]
      }

      IMPORTANT: Respond with the JSON only, no other text or explanation.
    `;
}

app.post('/api/analyze-product', async (req, res) => {
    try {
        const { productInfo } = req.body;
        console.log('Request body:', req.body);

        if (!productInfo) {
            return res.status(400).json({ success: false, message: 'Missing product information in request' });
        }

        if (!productInfo.productName) {
            return res.status(400).json({ success: false, message: 'Missing product name in request' });
        }

        if (!productInfo.price) {
            console.log('Warning: Missing price in productInfo, using placeholder');
            productInfo.price = 'unknown price';
        }

        if (!productInfo.domain) {
            console.log('Warning: Missing domain in productInfo, using placeholder');
            productInfo.domain = 'unknown website';
        }

        const prompt = constructProductAnalysisPrompt(productInfo);

        let responseData;

        try {
            console.log('Sending request to Claude API...');
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-7-sonnet-20250219',
                max_tokens: 1024,
                messages: [
                    { role: 'user', content: prompt }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            });

            const claudeContent = response.data.content[0].text;
            console.log('Claude response content:', claudeContent.substring(0, 200) + '...');

            try {
                const jsonMatch = claudeContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResponse = JSON.parse(jsonMatch[0]);

                    // Filter only Amazon, eBay, or Best Buy
                    const allowedSites = ['amazon.com', 'ebay.com', 'bestbuy.com'];
                    const filteredAlternatives = (parsedResponse.alternatives || []).filter((alt) =>
                        allowedSites.some(site => alt.searchUrl.toLowerCase().includes(site))
                    );

                    responseData = {
                        searchTerms: parsedResponse.searchTerms,
                        alternatives: filteredAlternatives
                    };

                    const scrapeResults = await Promise.all(filteredAlternatives.map(async (alt) => {
                        try {
                            if (alt.searchUrl.includes('amazon.com')) {
                                const keyword = productInfo.productName
                                .split(' ')      // Split only by spaces
                                .slice(0, 4)     // Take the first 4 words
                                .join(' ');      // Rejoin them into a single string
                              
                              return await scrapeAmazon(alt.searchUrl, keyword);
                              
                            }
                           if (alt.searchUrl.includes('ebay.com')) {
                                return await scrapeEbay(alt.searchUrl);
                            }
                            if (alt.searchUrl.includes('bestbuy.com')) {
                               return await scrapeBestBuy(alt.searchUrl);
                            }
                        } catch (err) {
                            console.error(`Error scraping ${alt.searchUrl}:`, err.message);
                            return null;
                        }
                    }));
                    
                    const bestDeals = scrapeResults.filter(Boolean).sort((a, b) => a.price - b.price);
                    responseData.bestDeals = bestDeals;
                    console.log('lowest priced products!!!!');
                    console.log(responseData.bestDeals)
                    

                    if (responseData.alternatives.length === 0) {
                        throw new Error('No valid alternatives from Claude response');
                    }
                } else {
                    throw new Error('No JSON found in Claude response');
                }
            } catch (parseError) {
                console.error('Error parsing or filtering Claude response:', parseError);
                const searchTerms = productInfo.productName.split(' ').slice(0, 3).join(' ');
                responseData = {
                    searchTerms,
                    alternatives: [
                        {
                            site: "Amazon",
                            searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}`,
                            notes: "Major retailer with competitive pricing"
                        },
                        {
                            site: "eBay",
                            searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerms)}`,
                            notes: "Check for new and used options"
                        },
                        {
                            site: "Best Buy",
                            searchUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(searchTerms)}`,
                            notes: "Great for electronics and appliances"
                        }
                    ]
                };
            }

        } catch (apiError) {
            console.error('Claude API error:', apiError.message);

            const searchTerms = productInfo.productName.split(' ').slice(0, 3).join(' ');
            responseData = {
                searchTerms,
                alternatives: [
                    {
                        site: "Amazon",
                        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}`,
                        notes: "Major retailer with competitive pricing"
                    },
                    {
                        site: "eBay",
                        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerms)}`,
                        notes: "Check for new and used options"
                    },
                    {
                        site: "Best Buy",
                        searchUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(searchTerms)}`,
                        notes: "Great for electronics and appliances"
                    }
                ]
            };
        }

        return res.json({ success: true, data: responseData });

    } catch (error) {
        console.error('Unexpected error:', error.message);

        const searchTerms = productInfo && productInfo.productName
            ? productInfo.productName.split(' ').slice(0, 3).join(' ')
            : "product";

        return res.status(500).json({
            success: false,
            message: `Error analyzing product: ${error.message}`,
            fallbackData: {
                searchTerms,
                alternatives: [
                    {
                        site: "Amazon",
                        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerms)}`,
                        notes: "Major retailer with competitive pricing"
                    },
                    {
                        site: "eBay",
                        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerms)}`,
                        notes: "Check for new and used options"
                    },
                    {
                        site: "Best Buy",
                        searchUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(searchTerms)}`,
                        notes: "Great for electronics and appliances"
                    }
                ]
            }
        });
    }
});
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
