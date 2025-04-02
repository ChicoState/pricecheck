const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

// Proxy endpoint for Claude API
app.post('/api/analyze-product', async (req, res) => {
    try {
        const { productInfo } = req.body;

        // More detailed validation and debugging
        console.log('Request body:', req.body);

        if (!productInfo) {
            console.error('Missing productInfo in request');
            return res.status(400).json({
                success: false,
                message: 'Missing product information in request'
            });
        }

        // Validate required fields with detailed error messages
        if (!productInfo.productName) {
            console.error('Missing productName in productInfo');
            return res.status(400).json({
                success: false,
                message: 'Missing product name in request'
            });
        }

        // Handle undefined or null price gracefully
        if (!productInfo.price) {
            console.log('Warning: Missing price in productInfo, using placeholder');
            productInfo.price = 'unknown price';
        }

        // Handle undefined or null domain gracefully
        if (!productInfo.domain) {
            console.log('Warning: Missing domain in productInfo, using placeholder');
            productInfo.domain = 'unknown website';
        }

        console.log('Received product info:', JSON.stringify(productInfo, null, 2));

        // Create a more resilient product name for the prompt
        const productNameSafe = productInfo.productName || 'Unknown Product';
        const priceSafe = productInfo.price || 'Unknown Price';
        const domainSafe = productInfo.domain || 'Unknown Website';

        // Construct prompt for Claude using safe values
        const prompt = `
      I'm looking at a product: "${productNameSafe}" with a price of ${priceSafe} on ${domainSafe}.
      
      Please:
      1. Identify key search terms for this product
      2. Suggest 3-5 alternative websites where I might find this cheaper
      3. For each alternative, provide:
         - The website name
         - A search URL I can use to find this product there
         - Any known price comparison information if available
      
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

        let responseData;

        try {
            console.log('Sending request to Claude API...');

            // Make request to Anthropic API with correct format
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

            console.log('Received response from Claude API');

            // Extract the Claude response
            const claudeContent = response.data.content[0].text;
            console.log('Claude response content:', claudeContent.substring(0, 200) + '...');

            // Look for JSON in the response
            try {
                // Try to extract JSON from the text response
                const jsonMatch = claudeContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    responseData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in Claude response');
                }
            } catch (parseError) {
                console.error('Error parsing Claude response:', parseError);
                throw parseError; // Re-throw to be caught by outer catch
            }

        } catch (apiError) {
            console.error('Claude API error:', apiError.message);

            if (apiError.response) {
                console.error('API response status:', apiError.response.status);
                console.error('API response data:', JSON.stringify(apiError.response.data, null, 2));
            }

            // Create a fallback response when the API call fails
            const searchTerms = productNameSafe.split(' ').slice(0, 3).join(' ');
            responseData = {
                searchTerms: searchTerms,
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
                        site: "Walmart",
                        searchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(searchTerms)}`,
                        notes: "Often has lower prices than competitors"
                    }
                ]
            };
        }

        // Return the data - this happens whether the API call succeeded or failed
        return res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        // This is for any other unexpected errors in the route handler
        console.error('Unexpected error:', error.message);

        // Create a fallback response with generic alternatives
        const searchTerms = productInfo && productInfo.productName
            ? productInfo.productName.split(' ').slice(0, 3).join(' ')
            : "product";

        return res.status(500).json({
            success: false,
            message: `Error analyzing product: ${error.message}`,
            fallbackData: {
                searchTerms: searchTerms,
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
                        site: "Walmart",
                        searchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(searchTerms)}`,
                        notes: "Often has lower prices than competitors"
                    }
                ]
            }
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});