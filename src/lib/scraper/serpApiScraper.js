import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Scrapes Google Shopping via SerpAPI.
 * Returns results from smaller sellers, Croma, Vijay Sales, etc.
 * NOTE: Amazon, Flipkart, Myntra, Meesho, Ajio do NOT appear in Google Shopping India.
 * Those are handled by dedicated functions below.
 */
export async function scrapeViaSerpApi(query, maxResults = 12) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY is not set in environment variables.");

  console.log(`🛒 SerpAPI Google Shopping: "${query}" (India)`);

  const { data } = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "google_shopping",
      q: query,
      gl: "in",
      hl: "en",
      num: 40,
      api_key: apiKey,
    },
    timeout: 15000,
  });

  const rawResults = data.shopping_results || [];
  console.log(`✅ SerpAPI Google Shopping: ${rawResults.length} raw results`);

  const products = rawResults
    .filter((item) => item.title && item.extracted_price)
    .slice(0, maxResults)
    .map((item) => normalizeGoogleShoppingProduct(item));

  console.log(`📦 SerpAPI Google Shopping: ${products.length} products`);
  return products;
}

/**
 * Scrapes Amazon India via SerpAPI's dedicated Amazon search engine.
 * Returns real Amazon.in product listings with correct prices.
 */
export async function scrapeAmazonViaSerpApi(query, maxResults = 8) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY is not set in environment variables.");

  console.log(`🛒 SerpAPI Amazon: "${query}" (amazon.in)`);

  const { data } = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "amazon",
      k: query,
      amazon_domain: "amazon.in",
      api_key: apiKey,
    },
    timeout: 15000,
  });

  const rawResults = data.organic_results || [];
  console.log(`✅ SerpAPI Amazon: ${rawResults.length} raw results`);

  // NOTE: Amazon engine returns extracted_price (number) and delivery (array)
  const products = rawResults
    .filter((item) => item.title && item.extracted_price)
    .slice(0, maxResults)
    .map((item) => ({
      title: item.title,
      price: item.extracted_price,
      originalPrice: null,
      link: item.link_clean || item.link || `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
      image: item.thumbnail || null,
      platform: "Amazon",
      rating: item.rating || null,
      reviews: item.reviews || null,
      shipping: Array.isArray(item.delivery)
        ? item.delivery[0]
        : (item.delivery || "Check site"),
      discount: null,
      bankOffers: item.offers || [],
      cashbackOffers: [],
    }));

  console.log(`📦 SerpAPI Amazon: ${products.length} products`);
  return products;
}

/**
 * Scrapes Flipkart via direct HTTP + Cheerio.
 * Flipkart's search page is server-side rendered — Cheerio can parse it.
 * Uses the real CSS class names discovered by inspecting the live page.
 */
export async function scrapeFlipkartDirect(query, maxResults = 8) {
  const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&sort=relevance`;
  console.log(`🛒 Flipkart Direct: "${query}"`);

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      timeout: 12000,
    });

    const $ = cheerio.load(html);
    const products = [];

    // Each product card has [data-id] containing the product ID
    $("[data-id]").slice(0, maxResults * 2).each((_, el) => {
      try {
        // Title: class RG5Slk (discovered by live inspection)
        const title = $(el).find(".RG5Slk").text().trim() ||
                      $(el).find("a[title]").attr("title");
        if (!title) return;

        // Price: class Nx9bqj or ZFwe0M (discovered by live inspection)
        const priceText =
          $(el).find(".Nx9bqj, .ZFwe0M, .jIjQ8S .col .k7wcnx .oFEPlD").first().text();
        // fallback: grab any text that looks like a rupee price
        const priceMatch = priceText.match(/₹[\d,]+/) || $(el).text().match(/₹([\d,]+)/);
        const price = priceMatch
          ? parseInt(priceMatch[0].replace(/[₹,]/g, ""))
          : 0;

        const href = $(el).find("a[href]").first().attr("href");
        const fullLink = href
          ? href.startsWith("http") ? href : `https://www.flipkart.com${href}`
          : null;

        const image = $(el).find("img").first().attr("src");
        const rating = parseFloat($(el).find(".XQDdHH, ._3LWZlK").first().text()) || null;

        if (title && price > 0 && fullLink) {
          products.push({
            title,
            price,
            originalPrice: null,
            link: fullLink,
            image: image || null,
            platform: "Flipkart",
            rating,
            reviews: null,
            shipping: "Free Delivery",
            discount: null,
            bankOffers: [],
            cashbackOffers: [],
          });
        }
      } catch (_err) {
        // skip malformed elements
      }
    });

    console.log(`📦 Flipkart Direct: ${products.length} products found`);
    return products.slice(0, maxResults);
  } catch (err) {
    console.warn(`⚠️ Flipkart Direct scrape failed: ${err.message}`);
    return [];
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeGoogleShoppingProduct(item) {
  const platform = normalizePlatformName(item.source || "Unknown");
  const price = item.extracted_price || 0;
  const originalPrice = item.extracted_old_price || null;

  const discount =
    originalPrice && originalPrice > price
      ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
      : item.tag || null;

  return {
    title: item.title,
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
    link: item.link || item.product_link || "#",
    image: item.thumbnail || null,
    platform,
    rating: item.rating || null,
    reviews: item.reviews || null,
    shipping: item.delivery || "Check site",
    discount,
    bankOffers: [],
    cashbackOffers: [],
  };
}

function normalizePlatformName(source) {
  const s = source.toLowerCase();
  if (s.includes("amazon")) return "Amazon";
  if (s.includes("flipkart")) return "Flipkart";
  if (s.includes("myntra")) return "Myntra";
  if (s.includes("nykaa")) return "Nykaa";
  if (s.includes("ajio")) return "Ajio";
  if (s.includes("meesho")) return "Meesho";
  if (s.includes("croma")) return "Croma";
  if (s.includes("snapdeal")) return "Snapdeal";
  if (s.includes("tatacliq") || s.includes("tata cliq")) return "Tata CLiQ";
  if (s.includes("reliance") || s.includes("jiomart")) return "JioMart";
  if (s.includes("vijay sales")) return "Vijay Sales";
  if (s.includes("paytm")) return "Paytm Mall";
  if (s.includes("shopsy")) return "Shopsy";
  if (s.includes("blinkit")) return "Blinkit";
  if (s.includes("bigbasket")) return "BigBasket";
  return source.replace(/\.(com|in|co\.in)$/i, "").trim();
}
