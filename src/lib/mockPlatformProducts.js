/**
 * Mock platform products generator — used only in tests or local dev
 * when all scraping sources are unavailable.
 *
 * NOT used in production API routes. The route returns an empty array
 * honestly when no products are found.
 *
 * @param {string} platform - Platform name e.g. "Amazon"
 * @param {string} query - Search query
 * @param {number} count - How many mock products to generate
 * @returns {Array}
 */
export function generateMockProducts(platform, query, count = 2) {
  const basePrice = Math.floor(Math.random() * 20000) + 5000;
  return Array.from({ length: count }, (_, i) => ({
    platform,
    title: `${query} ${i === 0 ? "- Top Pick" : "- Value Edition"} (${platform})`,
    price: basePrice - i * 500,
    originalPrice: basePrice + 2000,
    link: `https://www.${platform.toLowerCase()}.in`,
    image: null,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    shipping: "Check site",
    discount: "Check offers",
    bankOffers: [],
    cashbackOffers: [],
    _isMock: true,
  }));
}
