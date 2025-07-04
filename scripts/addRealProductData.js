import { db } from "../src/lib/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

// Real product URLs from the scraper results
const realProducts = [
  {
    url: "https://www.amazon.in/Samsung-Sapphire-Snapdragon-Processor-Security/dp/B0CV7KZLL4",
    title: "Samsung Galaxy M14 4G (Sapphire Blue,4GB,64GB)",
    basePrice: 9998
  },
  {
    url: "https://www.amazon.in/Samsung-5000mAh-Snapdragon-Processor-Security/dp/B0CV78R7FL",
    title: "Samsung Galaxy M14 4G (Arctic Blue,4GB,64GB)",
    basePrice: 9898
  },
  {
    url: "https://www.amazon.in/Samsung-Galaxy-Smoky-128GB-Storage/dp/B0BZCV25LG",
    title: "Samsung Galaxy M14 5G (Smoky Teal,4GB,128GB Storage)",
    basePrice: 17990
  },
  {
    url: "https://www.amazon.in/Samsung-Sapphire-Snapdragon-Processor-Security/dp/B0CV7MPKNK",
    title: "Samsung Galaxy M14 4G (Sapphire Blue,6GB,128GB)",
    basePrice: 12980
  },
  // Normalized versions for better matching
  {
    url: "https://www.amazon.in/dp/B0CV7KZLL4",
    title: "Samsung Galaxy M14 4G (Sapphire Blue,4GB,64GB) - Normalized",
    basePrice: 9998
  },
  {
    url: "https://www.amazon.in/dp/B0CV78R7FL",
    title: "Samsung Galaxy M14 4G (Arctic Blue,4GB,64GB) - Normalized",
    basePrice: 9898
  },
  {
    url: "https://www.amazon.in/dp/B0BZCV25LG",
    title: "Samsung Galaxy M14 5G (Smoky Teal,4GB,128GB) - Normalized",
    basePrice: 17990
  },
  {
    url: "https://www.amazon.in/dp/B0CV7MPKNK",
    title: "Samsung Galaxy M14 4G (Sapphire Blue,6GB,128GB) - Normalized",
    basePrice: 12980
  },
  // Just product IDs
  {
    url: "B0CV7KZLL4",
    title: "Samsung Galaxy M14 4G (Sapphire Blue,4GB,64GB) - ID Only",
    basePrice: 9998
  },
  {
    url: "B0CV78R7FL",
    title: "Samsung Galaxy M14 4G (Arctic Blue,4GB,64GB) - ID Only",
    basePrice: 9898
  }
];

// Generate realistic price history data
function generatePriceHistory(basePrice, days = 45) {
  const history = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add realistic price fluctuation patterns
    const randomChange = (Math.random() - 0.5) * 0.08; // ±4% random change
    const weeklyTrend = Math.sin(i / 7) * 0.03; // Weekly cycles
    const monthlyTrend = Math.sin(i / 30) * 0.05; // Monthly cycles
    const weekendDiscount = (date.getDay() === 0 || date.getDay() === 6) ? -0.015 : 0; // Weekend sales
    const flashSale = Math.random() < 0.05 ? -0.1 : 0; // 5% chance of flash sale
    
    currentPrice = currentPrice * (1 + randomChange + weeklyTrend + monthlyTrend + weekendDiscount + flashSale);
    
    // Keep price within reasonable bounds (±30% of base price)
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice));
    
    history.push({
      timestamp: date.toISOString(),
      price: Math.round(currentPrice)
    });
  }
  
  return history;
}

async function addRealProductData() {
  try {
    console.log("🚀 Adding real product data for prediction testing...");
    
    for (const product of realProducts) {
      const history = generatePriceHistory(product.basePrice, 60); // 60 days of data
      const encodedUrl = encodeURIComponent(product.url);
      const ref = doc(db, "price-history", encodedUrl);

      await setDoc(ref, {
        title: product.title,
        history: history,
        lastUpdated: new Date().toISOString(),
        productUrl: product.url
      });

      console.log(`✅ Added history for: ${product.title} (${product.url})`);
      console.log(`   📊 Price range: ₹${Math.min(...history.map(h => h.price))} - ₹${Math.max(...history.map(h => h.price))}`);
    }
    
    console.log("\n🎉 All real product data added successfully!");
    console.log(`📈 Total products: ${realProducts.length}`);
    console.log("🔮 Price predictions should now work for Samsung Galaxy M14 search results!");
    
  } catch (error) {
    console.error("❌ Error adding real product data:", error);
  }
}

// Run the script
addRealProductData();
