import axios from "axios";
import * as cheerio from "cheerio";

// ScrapingBee API integration
export async function scrapeWithAPI(url, query) {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  
  if (!apiKey) {
    throw new Error("ScrapingBee API key not found");
  }

  try {
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/`;
    const response = await axios.get(scrapingBeeUrl, {
      params: {
        api_key: apiKey,
        url: url,
        render_js: 'false',
        premium_proxy: 'true',
        country_code: 'in'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // Amazon parsing
    if (url.includes('amazon.in')) {
      return parseAmazonWithAPI($, query);
    }
    
    // Snapdeal parsing
    if (url.includes('snapdeal.com')) {
      return parseSnapdealWithAPI($, query);
    }

    // Croma parsing
    if (url.includes('croma.com')) {
      return parseCromaWithAPI($, query);
    }

    return products;
  } catch (error) {
    console.error("ScrapingBee API error:", error);
    throw error;
  }
}

function parseAmazonWithAPI($, query) {
  const products = [];
  
  $('[data-component-type="s-search-result"]').each((_, element) => {
    try {
      const $element = $(element);
      
      const title = $element.find('h2 a span').text().trim();
      if (!title) return;
      
      const link = "https://www.amazon.in" + $element.find('h2 a').attr('href');
      
      const priceText = $element.find('.a-price .a-offscreen').first().text();
      const price = parseInt(priceText.replace(/[₹,]/g, '').trim()) || 0;
      
      const image = $element.find('img').attr('src');
      const rating = parseFloat($element.find('.a-icon-alt').text().replace(/[^\d.]/g, '')) || 0;
      
      if (title && price > 0) {
        products.push({
          title,
          price,
          link,
          image,
          rating,
          platform: "Amazon"
        });
      }
    } catch (error) {
      console.error("Error parsing Amazon product:", error);
    }
  });
  
  return products;
}

function parseSnapdealWithAPI($, query) {
  const products = [];
  
  $('.product-tuple-listing').each((_, element) => {
    try {
      const $element = $(element);
      
      const title = $element.find('.product-title').text().trim();
      if (!title) return;
      
      const link = $element.find('.product-title').attr('href');
      
      const priceText = $element.find('.lfloat.product-price').text();
      const price = parseInt(priceText.replace(/[₹,]/g, '').trim()) || 0;
      
      const image = $element.find('img').attr('src');
      
      if (title && price > 0) {
        products.push({
          title,
          price,
          link,
          image,
          rating: 0,
          platform: "Snapdeal"
        });
      }
    } catch (error) {
      console.error("Error parsing Snapdeal product:", error);
    }
  });
  
  return products;
}

function parseCromaWithAPI($, query) {
  const products = [];
  
  $('.product-item').each((_, element) => {
    try {
      const $element = $(element);
      
      const title = $element.find('.product-title').text().trim();
      if (!title) return;
      
      const link = $element.find('a').attr('href');
      
      const priceText = $element.find('.amount').text();
      const price = parseInt(priceText.replace(/[₹,]/g, '').trim()) || 0;
      
      const image = $element.find('img').attr('src');
      
      if (title && price > 0) {
        products.push({
          title,
          price,
          link,
          image,
          rating: 0,
          platform: "Croma"
        });
      }
    } catch (error) {
      console.error("Error parsing Croma product:", error);
    }
  });
  
  return products;
}