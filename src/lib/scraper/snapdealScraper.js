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

    $(".product-tuple-listing").slice(0, 5).each((_, el) => {
      const title = $(el).find(".product-title").text().trim();
      const priceText = $(el).find(".product-price").text().replace(/[^\d]/g, "");
      const price = parseFloat(priceText);
      const link = "https://www.snapdeal.com" + $(el).find("a.dp-widget-link").attr("href");
      const image = $(el).find("img.product-image").attr("src") || $(el).find("source").attr("srcset");

      if (title && price && link) {
        results.push({
          title,
          price,
          image: image?.startsWith("http") ? image : "https:" + image,
          link,
          retailer: "Snapdeal",
        });
      }
    });

    return results;
  } catch (err) {
    console.error("❌ Snapdeal Scraping Failed:", err.message);
    return [];
  }
}
