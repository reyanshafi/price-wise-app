import {
  scrapeViaSerpApi,
  scrapeAmazonViaSerpApi,
  scrapeFlipkartDirect,
} from "@/lib/scraper/serpApiScraper";
import { scrapeAmazon } from "@/lib/scraper/amazonScraper";
import { scrapeSnapdeal } from "@/lib/scraper/snapdealScraper";
import { scrapeCroma } from "@/lib/scraper/cromaScraper";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  console.log(`\n🔍 Fetching products for: "${query}"`);

  // ── Run all sources in parallel ──────────────────────────────────────────────
  // 1. SerpAPI Google Shopping  → Myntra, Nykaa, Ajio, Meesho, Croma, Snapdeal, etc.
  // 2. SerpAPI Amazon engine    → Real Amazon.in results
  // 3. Flipkart direct          → Direct HTTP scrape (partial SSR)
  // All three run simultaneously — fastest wins, errors are silent.

  const [googleShoppingResults, amazonResults, flipkartResults] = await Promise.all([
    scrapeViaSerpApi(query, 16).catch((err) => {
      console.warn("⚠️ Google Shopping SerpAPI failed:", err.message);
      return [];
    }),
    scrapeAmazonViaSerpApi(query, 6).catch((err) => {
      console.warn("⚠️ Amazon SerpAPI failed:", err.message);
      return [];
    }),
    scrapeFlipkartDirect(query, 6).catch((err) => {
      console.warn("⚠️ Flipkart direct failed:", err.message);
      return [];
    }),
  ]);

  let products = [...amazonResults, ...flipkartResults, ...googleShoppingResults];

  console.log(`📊 Raw counts — Amazon: ${amazonResults.length}, Flipkart: ${flipkartResults.length}, Google Shopping: ${googleShoppingResults.length}`);

  // ── Fallback: legacy axios scrapers if everything above failed ───────────────
  if (products.length === 0) {
    console.log("🔄 All primary sources failed — trying legacy direct scrapers...");

    const [amzFallback, sdFallback, crFallback] = await Promise.all([
      scrapeAmazon(query).catch(() => []),
      scrapeSnapdeal(query).catch(() => []),
      scrapeCroma(query).catch(() => []),
    ]);

    products = [...amzFallback, ...sdFallback, ...crFallback];
    console.log(`📊 Legacy fallback: ${products.length} products`);
  }

  // ── Empty state — return honestly ────────────────────────────────────────────
  if (products.length === 0) {
    return Response.json(
      {
        query,
        results: [],
        totalScraped: 0,
        source: "none",
        message: "No products found. Try a more specific search.",
      },
      { status: 200 }
    );
  }

  // ── Deduplicate by title (first 45 chars, lowercased) ────────────────────────
  const seen = new Set();
  const unique = products.filter((p) => {
    const key = (p.title || "").toLowerCase().slice(0, 45);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const platforms = [...new Set(unique.map((p) => p.platform))];
  console.log(`✅ Final: ${unique.length} unique products from: ${platforms.join(", ")}`);

  const source =
    amazonResults.length > 0 || googleShoppingResults.length > 0
      ? "serpapi"
      : "direct";

  return Response.json(
    {
      query,
      results: unique,
      totalScraped: unique.length,
      source,
      platforms,
    },
    { status: 200 }
  );
}
