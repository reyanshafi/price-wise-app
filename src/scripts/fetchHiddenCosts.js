import axios from 'axios';
import * as cheerio from "cheerio";

// Simple in-memory cache to avoid repeated requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function fetchHiddenCosts(url) {
  // Check cache first
  const cacheKey = url;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    console.log('Using cached hidden costs for:', url);
    return cachedResult.data;
  }

  try {
    // Add delay to avoid being blocked
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.google.com/',
      },
      timeout: 10000, // 10 second timeout
    });
    
    const $ = cheerio.load(data);
    let tax = 0;
    let shipping = 0;

    // Amazon India selectors
    if (url.includes('amazon.in') || url.includes('amazon.com')) {
      // Shipping cost selectors
      const shippingSelectors = [
        '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span',
        '#deliveryMessageMirId span',
        '#price-shipping-message',
        '[data-feature-name="delivery"] span',
        '.a-color-secondary.a-text-bold',
        '#deliveryBlockMessage span'
      ];

      // Tax selectors
      const taxSelectors = [
        '#priceblock_dealprice_tax',
        '#apex_desktop .a-price .a-offscreen',
        '[data-feature-name="applicablePromotionsList"] .a-color-secondary',
        '#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_OPTIONS .a-color-secondary'
      ];

      // Try to find shipping costs
      for (const selector of shippingSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('₹') || text.includes('rs')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              shipping = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
          // Free shipping indicators
          if (text.includes('free') && text.includes('shipping')) {
            shipping = 0;
            break;
          }
        }
      }

      // Try to find tax information
      for (const selector of taxSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('tax') || text.includes('gst')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              tax = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
        }
      }
    }

    // Flipkart selectors
    else if (url.includes('flipkart.com')) {
      // Shipping cost selectors
      const shippingSelectors = [
        '._2Kn22P._3OVk7H',
        '._16FRp0',
        '._3k-BhJ',
        '[data-testid="delivery-info"] span',
        '._2UJ9Xl span'
      ];

      // Tax selectors
      const taxSelectors = [
        '._1_WHN1',
        '._30jeq3',
        '._3I9_wc',
        '._25b18c'
      ];

      // Try to find shipping costs
      for (const selector of shippingSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('₹') || text.includes('rs')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              shipping = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
          if (text.includes('free') && text.includes('delivery')) {
            shipping = 0;
            break;
          }
        }
      }

      // Try to find tax information
      for (const selector of taxSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('tax') || text.includes('gst')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              tax = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
        }
      }
    }

    // Myntra selectors
    else if (url.includes('myntra.com')) {
      // Shipping/delivery info
      const shippingSelectors = [
        '.pdp-delivery-options-info',
        '.delivery-options-info',
        '.delivery-details'
      ];

      for (const selector of shippingSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('free') && text.includes('delivery')) {
            shipping = 0;
            break;
          }
          if (text.includes('₹') || text.includes('rs')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              shipping = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
        }
      }
    }

    // Snapdeal selectors
    else if (url.includes('snapdeal.com')) {
      // Shipping selectors
      const shippingSelectors = [
        '.shipping-charges',
        '.delivery-info',
        '#delivery-info'
      ];

      for (const selector of shippingSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().toLowerCase();
          if (text.includes('free') && text.includes('shipping')) {
            shipping = 0;
            break;
          }
          if (text.includes('₹') || text.includes('rs')) {
            const match = text.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
            if (match) {
              shipping = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
        }
      }
    }

    // Fallback: If no specific costs found, estimate based on common patterns
    if (shipping === 0 && tax === 0) {
      // Look for any pricing information in the page
      const allText = $('body').text().toLowerCase();
      
      // Check for free shipping mentions
      if (allText.includes('free shipping') || allText.includes('free delivery')) {
        shipping = 0;
      }
      
      // Estimate tax for India (GST is typically 12-18% for most products)
      const priceElements = $('[data-price], .price, .current-price, .selling-price');
      if (priceElements.length > 0) {
        const priceText = priceElements.first().text();
        const priceMatch = priceText.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
        if (priceMatch) {
          const basePrice = parseFloat(priceMatch[1].replace(/,/g, ''));
          // Estimate 12% GST (common rate for electronics/consumer goods)
          tax = Math.round(basePrice * 0.12);
        }
      }
    }

    const result = {
      tax: Math.round(tax) || 0,
      shipping: Math.round(shipping) || 0
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error fetching hidden costs:', error.message);
    // Return default values on error
    const errorResult = {
      tax: 0,
      shipping: 0
    };
    
    // Cache error result for a shorter time
    cache.set(cacheKey, {
      data: errorResult,
      timestamp: Date.now() - CACHE_DURATION + 60000 // Cache for 1 minute only
    });
    
    return errorResult;
  }
}
