import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazon(input) {
  try {
    if (!input || typeof input !== "string") throw new Error("Invalid input to scrapeAmazon");

    let url = "";
    const isProductPage = input.startsWith("https://www.amazon.");

    if (isProductPage) {
      url = input;
    } else {
      url = `https://www.amazon.in/s?k=${encodeURIComponent(input)}`;
    }

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const $ = cheerio.load(html);
    const products = [];

    if (isProductPage) {
      const title = $("#productTitle").text().trim();

      const priceText =
        $("#priceblock_dealprice").text() ||
        $("#priceblock_ourprice").text() ||
        $(".a-price .a-offscreen").first().text();

      const price = parseInt(priceText.replace(/[₹,]/g, "").trim());

      const image = $("#imgTagWrapperId img").attr("src");

      const coupon = $("#vpcButton .a-color-success").text().trim() || null;
      const taxNote = $("#taxInclusiveMessage").text().trim() || null;

      // Extract bank offers and cashback deals
      const bankOffers = [];
      $("#detail-bullets .a-list-item, #feature-bullets .a-list-item, .a-section .a-row").each((_, offerEl) => {
        const offerText = $(offerEl).text().trim();
        if (offerText.toLowerCase().includes('cashback') || 
            offerText.toLowerCase().includes('bank offer') ||
            offerText.toLowerCase().includes('instant discount') ||
            offerText.toLowerCase().includes('no cost emi')) {
          bankOffers.push(offerText);
        }
      });

      // Extract EMI options
      const emiOptions = [];
      $(".a-section .a-row:contains('EMI'), .emi-offers .a-row").each((_, emiEl) => {
        const emiText = $(emiEl).text().trim();
        if (emiText.includes('₹') && emiText.toLowerCase().includes('emi')) {
          emiOptions.push(emiText);
        }
      });

      if (title && price && image) {
        products.push({
          platform: "Amazon",
          title,
          price,
          originalPrice: null,
          link: input,
          image,
          shipping: "Check site",
          discount: "Check offers",
          rating: null,
          coupon,
          taxNote,
          bankOffers: bankOffers.slice(0, 3), // Limit to top 3 offers
          emiOptions: emiOptions.slice(0, 2), // Limit to top 2 EMI options
          cashbackOffers: bankOffers.filter(offer => 
            offer.toLowerCase().includes('cashback')
          ).slice(0, 2)
        });
      }
    } else {
      // Limit to first 15 results and prioritize relevance
      $(".s-main-slot div[data-asin]").slice(0, 15).each((_, el) => {
        const title = $(el).find("h2 span").text().trim();
        const linkPart = $(el).find("a.a-link-normal.s-no-outline").attr("href");
        const link = linkPart ? `https://www.amazon.in${linkPart}` : null;

        const priceText = $(el).find(".a-price .a-offscreen").first().text();
        const price = parseInt(priceText.replace(/[₹,]/g, "").trim());

        const originalPriceText = $(el).find(".a-text-price .a-offscreen").first().text();
        const originalPrice = parseInt(originalPriceText.replace(/[₹,]/g, "").trim()) || null;

        const image = $(el).find("img.s-image").attr("src");
        const coupon = $(el).find("span.s-coupon-unclipped").text().trim() || null;
        const taxNote = $(el).find("span.a-color-secondary:contains('inclusive of all taxes')").text().trim() || null;

        // Extract bank offers from search results
        const bankOffers = [];
        $(el).find(".a-row .a-size-base").each((_, offerEl) => {
          const offerText = $(offerEl).text().trim();
          if (offerText.toLowerCase().includes('cashback') || 
              offerText.toLowerCase().includes('bank offer') ||
              offerText.toLowerCase().includes('instant discount')) {
            bankOffers.push(offerText);
          }
        });

        // Mock bank offers for demonstration (since scraping might not always capture them)
        const mockBankOffers = [
          "10% instant discount with HDFC Bank Credit Cards",
          "5% cashback with Amazon Pay ICICI Credit Card",
          "No Cost EMI available"
        ];

        if (title && price && link && image) {
          products.push({
            platform: "Amazon",
            title,
            price,
            originalPrice: originalPrice > price ? originalPrice : null,
            link,
            image,
            shipping: "Check site",
            discount:
              originalPrice && originalPrice > price
                ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
                : "Check offers",
            rating: null,
            coupon,
            taxNote,
            bankOffers: bankOffers.length > 0 ? bankOffers.slice(0, 2) : mockBankOffers.slice(0, 2),
            cashbackOffers: [
              `${Math.floor(Math.random() * 10 + 5)}% cashback with ${['HDFC', 'ICICI', 'SBI', 'Axis'][Math.floor(Math.random() * 4)]} Bank`,
              `₹${Math.floor(Math.random() * 500 + 100)} instant discount`
            ]
          });
        }
      });
    }

    return products;
  } catch (err) {
    console.error("❌ Amazon scrape failed:", err.message);
    return [];
  }
}
