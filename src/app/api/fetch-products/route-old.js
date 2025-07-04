import { scrapeAmazonWithAPI, scrapeSnapdealWithAPI } from "@/lib/scraper/apiScraper";
import { scrapeAmazon } from "@/lib/scraper/amazonScraper";
import { scrapeSnapdeal } from "@/lib/scraper/snapdealScraper";
import { scrapeCroma } from "@/lib/scraper/cromaScraper";
import { scrapeFlipkart } from "@/lib/scraper/flipkartScraper";
import { scrapeMyntra } from "@/lib/scraper/myntraScraper";
import { scrapePaytm } from "@/lib/scraper/paytmScraper";
import { SCRAPING_CONFIG, getScrapingMethod, logScrapingConfig } from "@/lib/scraper/scrapingConfig";
import { generateMockProducts } from "@/lib/mockPlatformProducts";
import mockProducts from "@/lib/mockProducts";

// Helper function to detect fashion-related queries
function isFashionQuery(query) {
  const fashionKeywords = [
    'shirt', 'jeans', 'dress', 'shoes', 'sneakers', 'jacket', 'tshirt', 't-shirt',
    'kurta', 'saree', 'lehenga', 'blazer', 'coat', 'pants', 'skirt', 'top',
    'hoodie', 'sweater', 'boots', 'sandals', 'heels', 'bag', 'handbag', 'wallet',
    'watch', 'jewelry', 'earrings', 'necklace', 'ring', 'sunglasses', 'fashion',
    'clothing', 'apparel', 'wear', 'style'
  ];
  
  const queryLower = query.toLowerCase();
  return fashionKeywords.some(keyword => queryLower.includes(keyword));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query" }), {
      status: 400,
    });
  }

  try {
    console.log(`🔍 Fetching products for query: "${query}"`);
    logScrapingConfig();
    
    let amazonResults = [];
    let snapdealResults = [];
    let cromaResults = [];
    let flipkartResults = [];
    let myntraResults = [];
    let paytmResults = [];

    // Get scraping methods for each platform
    const amazonMethod = getScrapingMethod('amazon');
    const snapdealMethod = getScrapingMethod('snapdeal');
    const cromaMethod = getScrapingMethod('croma');
    const flipkartMethod = getScrapingMethod('flipkart');
    const myntraMethod = getScrapingMethod('myntra');
    const paytmMethod = getScrapingMethod('paytm');

    // Amazon scraping
    switch (amazonMethod) {
      case 'scrapingbee':
        try {
          console.log('🔄 Trying Amazon API scraping...');
          amazonResults = await scrapeAmazonWithAPI(query);
          console.log(`✅ Amazon API: ${amazonResults.length} products found`);
        } catch (error) {
          console.warn('⚠️ Amazon API scraping failed, falling back to custom scraper');
          console.warn('   Error:', error.message);
          try {
            amazonResults = await scrapeAmazon(query);
            console.log(`✅ Amazon custom fallback: ${amazonResults.length} products found`);
          } catch (fallbackError) {
            console.error('❌ Amazon custom scraper also failed:', fallbackError.message);
            amazonResults = [];
          }
        }
        break;
      case 'custom':
        amazonResults = await scrapeAmazon(query);
        break;
      case 'mock':
      default:
        amazonResults = mockProducts.slice(0, 2).map(product => ({
          ...product,
          title: `${query} - ${product.title}`,
          price: product.price + Math.floor(Math.random() * 1000),
        }));
        break;
    }

    // Snapdeal scraping
    switch (snapdealMethod) {
      case 'scrapingbee':
        try {
          console.log('🔄 Trying Snapdeal API scraping...');
          snapdealResults = await scrapeSnapdealWithAPI(query);
          console.log(`✅ Snapdeal API: ${snapdealResults.length} products found`);
        } catch (error) {
          console.warn('⚠️ Snapdeal API scraping failed, falling back to custom scraper');
          console.warn('   Error:', error.message);
          try {
            snapdealResults = await scrapeSnapdeal(query);
            console.log(`✅ Snapdeal custom fallback: ${snapdealResults.length} products found`);
          } catch (fallbackError) {
            console.error('❌ Snapdeal custom scraper also failed:', fallbackError.message);
            snapdealResults = [];
          }
        }
        break;
      case 'custom':
        snapdealResults = await scrapeSnapdeal(query);
        break;
      case 'mock':
      default:
        snapdealResults = mockProducts.slice(2, 4).map(product => ({
          ...product,
          platform: 'Snapdeal',
          title: `${query} - ${product.title}`,
          price: product.price + Math.floor(Math.random() * 500),
        }));
        break;
    }

    // Croma scraping (keeping custom for now)
    if (cromaMethod !== 'disabled') {
      try {
        console.log('🔄 Trying Croma custom scraping...');
        cromaResults = await scrapeCroma(query);
        console.log(`✅ Croma custom: ${cromaResults.length} products found`);
      } catch (error) {
        console.error('❌ Croma scraping failed:', error.message);
        cromaResults = [];
      }
      
      // Fallback to mock data if no products found
      if (cromaResults.length === 0) {
        console.log('🔄 Using Croma mock data as fallback...');
        cromaResults = generateMockProducts("Croma", query, 1);
        console.log(`✅ Croma mock fallback: ${cromaResults.length} products`);
      }
    }

    // Flipkart scraping
    if (flipkartMethod !== 'disabled') {
      try {
        console.log('🔄 Trying Flipkart custom scraping...');
        flipkartResults = await scrapeFlipkart(query);
        console.log(`✅ Flipkart custom: ${flipkartResults.length} products found`);
      } catch (error) {
        console.error('❌ Flipkart scraping failed:', error.message);
        flipkartResults = [];
      }
      
      // Fallback to mock data if no products found
      if (flipkartResults.length === 0) {
        console.log('🔄 Using Flipkart mock data as fallback...');
        flipkartResults = generateMockProducts("Flipkart", query, 2);
        console.log(`✅ Flipkart mock fallback: ${flipkartResults.length} products`);
      }
    }

    // Myntra scraping (for fashion-related queries)
    if (myntraMethod !== 'disabled' && isFashionQuery(query)) {
      try {
        console.log('🔄 Trying Myntra custom scraping...');
        myntraResults = await scrapeMyntra(query);
        console.log(`✅ Myntra custom: ${myntraResults.length} products found`);
      } catch (error) {
        console.error('❌ Myntra scraping failed:', error.message);
        myntraResults = [];
      }
      
      // Fallback to mock data if no products found
      if (myntraResults.length === 0) {
        console.log('🔄 Using Myntra mock data as fallback...');
        myntraResults = generateMockProducts("Myntra", query, 1);
        console.log(`✅ Myntra mock fallback: ${myntraResults.length} products`);
      }
    }

    // Paytm Mall scraping
    if (paytmMethod !== 'disabled') {
      try {
        console.log('🔄 Trying Paytm Mall custom scraping...');
        paytmResults = await scrapePaytm(query);
        console.log(`✅ Paytm Mall custom: ${paytmResults.length} products found`);
      } catch (error) {
        console.error('❌ Paytm Mall scraping failed:', error.message);
        paytmResults = [];
      }
      
      // Fallback to mock data if no products found
      if (paytmResults.length === 0) {
        console.log('🔄 Using Paytm Mall mock data as fallback...');
        paytmResults = generateMockProducts("Paytm Mall", query, 1);
        console.log(`✅ Paytm Mall mock fallback: ${paytmResults.length} products`);
      }
    }

    console.log("✅ Results Summary:");
    console.log(`   Amazon: ${amazonResults.length} products`);
    console.log(`   Snapdeal: ${snapdealResults.length} products`);
    console.log(`   Croma: ${cromaResults.length} products`);
    console.log(`   Flipkart: ${flipkartResults.length} products`);
    console.log(`   Myntra: ${myntraResults.length} products`);
    console.log(`   Paytm Mall: ${paytmResults.length} products`);

    const combined = [
      ...amazonResults,
      ...snapdealResults,
      ...cromaResults,
      ...flipkartResults,
      ...myntraResults,
      ...paytmResults,
    ];

    return new Response(JSON.stringify({ query, results: combined }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Scraping failed", details: err.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
