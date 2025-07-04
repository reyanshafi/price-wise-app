import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeSnapdeal(query) {
  const searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const $ = cheerio.load(html);
    const results = [];

    $(".product-tuple-listing").slice(0, 8).each((_, el) => {
      const title = $(el).find(".product-title").text().trim();
      const priceText = $(el).find(".product-price").text().replace(/[^\d]/g, "");
      const price = parseFloat(priceText);
      const link = "https://www.snapdeal.com" + $(el).find("a.dp-widget-link").attr("href");
      const image = $(el).find("img.product-image").attr("src") || $(el).find("source").attr("srcset");

      // Extract Snapdeal specific offers
      const bankOffers = [];
      $(el).find(".product-desc-rating .offers-list, .product-offer").each((_, offerEl) => {
        const offerText = $(offerEl).text().trim();
        if (offerText.toLowerCase().includes('cashback') || 
            offerText.toLowerCase().includes('bank') ||
            offerText.toLowerCase().includes('discount')) {
          bankOffers.push(offerText);
        }
      });

      // Mock Snapdeal offers
      const snapdealOffers = [
        `${Math.floor(Math.random() * 15 + 5)}% cashback with Snapdeal wallet`,
        `Extra ₹${Math.floor(Math.random() * 300 + 50)} off with select bank cards`,
        "Free delivery on orders above ₹499"
      ];

      if (title && price && link) {
        results.push({
          title,
          price,
          image: image?.startsWith("http") ? image : "https:" + image,
          link,
          platform: "Snapdeal",
          shipping: "Check site",
          discount: "Check offers",
          rating: Math.random() * 2 + 3, // Mock rating between 3-5
          bankOffers: bankOffers.length > 0 ? bankOffers.slice(0, 2) : snapdealOffers.slice(0, 2),
          cashbackOffers: [
            `${Math.floor(Math.random() * 12 + 3)}% cashback with Snapdeal wallet`,
            `₹${Math.floor(Math.random() * 200 + 25)} instant discount on first order`
          ]
        });
      }
    });

    return results;
  } catch (err) {
    console.error("❌ Snapdeal Scraping Failed:", err.message);
    return [];
  }
}
