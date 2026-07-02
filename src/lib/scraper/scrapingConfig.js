/**
 * Scraping config — controls which method is used per platform.
 * Since SerpAPI covers all platforms, individual platform methods are set to 'serp'.
 */
export const SCRAPING_CONFIG = {
  amazon: "serp",
  flipkart: "serp",
  myntra: "serp",
  snapdeal: "serp",
  croma: "serp",
  nykaa: "serp",
  ajio: "serp",
  meesho: "serp",
  paytm: "disabled",
};

export function getScrapingMethod(platform) {
  return SCRAPING_CONFIG[platform] || "serp";
}

export function logScrapingConfig() {
  console.log("⚙️ Scraping config:", SCRAPING_CONFIG);
}
