/**
 * Flipkart scraper — deferred to SerpAPI Google Shopping.
 * Direct scraping of Flipkart is blocked by Akamai Bot Manager.
 * SerpAPI handles Flipkart results as part of Google Shopping.
 */
export async function scrapeFlipkart(query) {
  console.log("ℹ️ Flipkart: using SerpAPI Google Shopping (see serpApiScraper.js)");
  return [];
}
