import { db } from "../src/lib/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

// Sample product URL (replace with actual URL from your scrapers)
const productUrl = "https://www.amazon.in/dp/B0BZCSWF3V"; // Samsung Galaxy M14 example

// Generate realistic price history data
function generatePriceHistory(basePrice, days = 30) {
  const history = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add some realistic price fluctuation
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random change
    const trendChange = Math.sin(i / 10) * 0.05; // Cyclical trend
    const weekendDiscount = date.getDay() === 0 || date.getDay() === 6 ? -0.02 : 0; // Weekend discounts
    
    currentPrice = currentPrice * (1 + randomChange + trendChange + weekendDiscount);
    
    // Keep price reasonable (don't let it drift too far)
    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice));
    
    history.push({
      timestamp: date.toISOString(),
      price: Math.round(currentPrice)
    });
  }
  
  return history;
}

async function addSamplePriceHistory() {
  try {
    const basePrice = 11499; // Base price for Samsung Galaxy M14
    const history = generatePriceHistory(basePrice, 45); // 45 days of data
    
    const encodedUrl = encodeURIComponent(productUrl);
    const ref = doc(db, "price-history", encodedUrl);

    await setDoc(ref, {
      title: "Samsung Galaxy M14 5G (Smoky Teal, 6GB, 128GB)",
      history: history
    });

    console.log("✅ Sample price history added successfully!");
    console.log(`📊 Added ${history.length} data points`);
    console.log(`💰 Price range: ₹${Math.min(...history.map(h => h.price))} - ₹${Math.max(...history.map(h => h.price))}`);
    
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
  }
}

// Add multiple products for testing
async function addMultipleSampleProducts() {
  const products = [
    {
      url: "https://www.amazon.in/dp/B0BZCSWF3V",
      title: "Samsung Galaxy M14 5G (Smoky Teal, 6GB, 128GB)",
      basePrice: 11499
    },
    {
      url: "https://www.amazon.in/dp/B09V4MXBS9",
      title: "iPhone 14 Pro Max 256GB Deep Purple",
      basePrice: 139900
    },
    {
      url: "https://www.flipkart.com/samsung-galaxy-m14",
      title: "Samsung Galaxy M14 5G - Flipkart",
      basePrice: 11749
    }
  ];

  for (const product of products) {
    try {
      const history = generatePriceHistory(product.basePrice, 60); // 60 days of data
      const encodedUrl = encodeURIComponent(product.url);
      const ref = doc(db, "price-history", encodedUrl);

      await setDoc(ref, {
        title: product.title,
        history: history
      });

      console.log(`✅ Added history for: ${product.title}`);
    } catch (error) {
      console.error(`❌ Error adding data for ${product.title}:`, error);
    }
  }
}

// Run the script
if (process.argv.includes('--multiple')) {
  addMultipleSampleProducts();
} else {
  addSamplePriceHistory();
}
