/**
 * Paytm Mall scraper — Paytm closed their marketplace in 2023.
 * No products to scrape. Returns empty array.
 */
export async function scrapePaytm(query) {
  console.log("ℹ️ Paytm Mall: service shut down, skipping.");
  return [];
}
