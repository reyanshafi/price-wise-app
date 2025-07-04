import { scrapeAmazon } from "@/lib/scraper/amazonScraper";
import { scrapeSnapdeal } from "@/lib/scraper/snapdealScraper";
import { scrapeCroma } from "@/lib/scraper/cromaScraper"; // ✅ Croma
import { scrapeWithAPI } from "@/lib/scraper/apiScraper";
import { filterRelevantProducts } from "@/lib/utils/productFilters";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query" }), {
      status: 400,
    });
  }

  try {
    console.log("🚀 Starting product fetch for query:", query);
    
    let amazonResults = [];
    let snapdealResults = [];
    let cromaResults = [];

    try {
      // Try direct scraping first
      const [amazonRes, snapdealRes, cromaRes] = await Promise.all([
        scrapeAmazon(query).catch(err => {
          console.warn("Direct Amazon scraping failed:", err.message);
          return [];
        }),
        scrapeSnapdeal(query).catch(err => {
          console.warn("Direct Snapdeal scraping failed:", err.message);
          return [];
        }),
        scrapeCroma(query).catch(err => {
          console.warn("Direct Croma scraping failed:", err.message);
          return [];
        })
      ]);

      amazonResults = amazonRes;
      snapdealResults = snapdealRes;
      cromaResults = cromaRes;

      console.log("✅ Direct scraping results:", {
        amazon: amazonResults.length,
        snapdeal: snapdealResults.length,
        croma: cromaResults.length
      });

      // If direct scraping fails, try API scraping
      if (amazonResults.length === 0 && snapdealResults.length === 0 && cromaResults.length === 0) {
        console.log("🔄 Direct scraping failed, trying API scraping...");
        
        try {
          const [amazonApiRes, snapdealApiRes, cromaApiRes] = await Promise.all([
            scrapeWithAPI(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, query).catch(err => {
              console.warn("API Amazon scraping failed:", err.message);
              return [];
            }),
            scrapeWithAPI(`https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}`, query).catch(err => {
              console.warn("API Snapdeal scraping failed:", err.message);
              return [];
            }),
            scrapeWithAPI(`https://www.croma.com/search?q=${encodeURIComponent(query)}`, query).catch(err => {
              console.warn("API Croma scraping failed:", err.message);
              return [];
            })
          ]);

          amazonResults = amazonApiRes;
          snapdealResults = snapdealApiRes;
          cromaResults = cromaApiRes;

          console.log("✅ API scraping results:", {
            amazon: amazonResults.length,
            snapdeal: snapdealResults.length,
            croma: cromaResults.length
          });
        } catch (apiError) {
          console.error("API scraping also failed:", apiError);
        }
      }
    } catch (error) {
      console.error("All scraping methods failed:", error);
    }

    const combined = [
      ...amazonResults,
      ...snapdealResults,
      ...cromaResults,
    ];

    // Filter for relevant products only - stricter filtering
    const relevantProducts = filterRelevantProducts(combined, query, 150, 8);
    
    console.log("✅ Filtered Relevant Products:", relevantProducts.length);
    console.log("🎯 Relevance scores:", relevantProducts.slice(0, 5).map(p => ({
      title: p.title.substring(0, 50) + "...",
      score: p.relevanceScore
    })));

    // If no products found, provide mock data for demo
    if (relevantProducts.length === 0) {
      console.log("🎭 No products found, providing mock data for demo");
      const mockProducts = [
        {
          title: `${query} - Premium Quality`,
          price: 15999,
          link: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
          image: "/globe.svg",
          rating: 4.2,
          platform: "Amazon",
          relevanceScore: 0.95
        },
        {
          title: `${query} - Best Seller`,
          price: 12999,
          link: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}`,
          image: "/globe.svg",
          rating: 4.0,
          platform: "Snapdeal",
          relevanceScore: 0.90
        },
        {
          title: `${query} - Latest Model`,
          price: 18999,
          link: `https://www.croma.com/search?q=${encodeURIComponent(query)}`,
          image: "/globe.svg",
          rating: 4.5,
          platform: "Croma",
          relevanceScore: 0.85
        }
      ];
      
      return new Response(JSON.stringify({ 
        query, 
        results: mockProducts,
        totalScraped: 0,
        relevantCount: mockProducts.length,
        demo: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ 
      query, 
      results: relevantProducts,
      totalScraped: combined.length,
      relevantCount: relevantProducts.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Scraping failed", details: err.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
