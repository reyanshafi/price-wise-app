/**
 * Alternative APIs — placeholder for future integrations.
 * Currently all scraping is handled by SerpAPI (see serpApiScraper.js).
 *
 * Potential additions:
 * - RapidAPI product search endpoints
 * - Platform-specific official APIs (if/when available)
 */
export async function scrapeViaAlternativeAPI(query, platform) {
  console.log(`ℹ️ alternativeAPIs: no alternative configured for ${platform}`);
  return [];
}
