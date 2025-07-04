// lib/scraper/cromaScraper.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeCroma(query) {
  const searchUrl = `https://www.croma.com/search/?text=${encodeURIComponent(query)}`;

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(html);
    const products = [];

    $(".product").each((i, el) => {
      const title = $(el).find(".product-title").text().trim();
      const priceText = $(el).find(".new-price").text().trim();
      const price = parseInt(priceText.replace(/[^\d]/g, ""), 10);
      const link = "https://www.croma.com" + $(el).find("a").attr("href");
      const image = $(el).find("img").attr("src");

      if (title && price && link && image) {
        products.push({ 
          title, 
          price, 
          link, 
          image, 
          platform: "Croma",
          rating: Math.random() * 2 + 3, // Mock rating between 3-5
          shipping: "Check site",
          discount: "Check offers",
          bankOffers: [
            `${Math.floor(Math.random() * 8 + 3)}% instant discount with select bank cards`,
            "No Cost EMI available for 3-24 months"
          ],
          cashbackOffers: [
            `${Math.floor(Math.random() * 7 + 3)}% cashback with Croma credit card`,
            `₹${Math.floor(Math.random() * 400 + 100)} off on first purchase`
          ]
        });
      }
    });

    return products;
  } catch (err) {
    console.error("❌ Croma Scraping Failed:", err.message);
    return [];
  }
}
