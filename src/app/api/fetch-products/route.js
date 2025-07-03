import { scrapeAmazon } from "@/lib/scraper/amazonScraper";
import { scrapeSnapdeal } from "@/lib/scraper/snapdealScraper";
import { scrapeCroma } from "@/lib/scraper/cromaScraper"; // ✅ Croma

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query" }), {
      status: 400,
    });
  }

  try {
    const [amazonResults, snapdealResults, cromaResults] = await Promise.all([
      scrapeAmazon(query),
      scrapeSnapdeal(query),
      scrapeCroma(query),
    ]);

    console.log("✅ Amazon Results:", amazonResults.length);
    console.log("✅ Snapdeal Results:", snapdealResults.length);
    console.log("✅ Croma Results:", cromaResults.length);

    const combined = [
      ...amazonResults,
      ...snapdealResults,
      ...cromaResults,
    ];

    return new Response(JSON.stringify({ query, results: combined }), {
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
