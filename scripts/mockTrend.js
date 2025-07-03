import { db } from "../src/lib/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

// 🔧 Replace this with a valid product URL you have already scraped
const productUrl = "https://www.amazon.in/dp/B09V4MXBS9"; // Example

const mockPrices = [
  { timestamp: "2025-07-01T10:00:00Z", price: 12000 },
  { timestamp: "2025-07-02T10:00:00Z", price: 11500 },
  { timestamp: "2025-07-03T10:00:00Z", price: 11100 },
  { timestamp: "2025-07-04T10:00:00Z", price: 10900 },
  { timestamp: "2025-07-05T10:00:00Z", price: 9999 },
];

async function insertMockTrend() {
  const encodedUrl = encodeURIComponent(productUrl);
  const ref = doc(db, "price-history", encodedUrl);

  const existing = (await getDoc(ref)).data()?.history || [];

  const updated = [...existing, ...mockPrices].slice(-50); // keep last 50

  await setDoc(ref, { history: updated });

  console.log("✅ Mock trend data inserted.");
}

insertMockTrend().catch((err) => {
  console.error("❌ Error inserting trend:", err);
});
