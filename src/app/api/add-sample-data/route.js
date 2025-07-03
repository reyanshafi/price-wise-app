import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET() {
  try {
    const sampleData = {
      title: "Sample Smartphone",
      history: [
        { price: 1599, timestamp: "2024-05-01T00:00:00Z" },
        { price: 1499, timestamp: "2024-05-15T00:00:00Z" },
        { price: 1399, timestamp: "2024-06-01T00:00:00Z" },
        { price: 1299, timestamp: "2024-06-15T00:00:00Z" }
      ]
    };

    const encodedUrl = encodeURIComponent("https://example.com/sample-product");
    await setDoc(doc(db, "price-history", encodedUrl), sampleData);

    return new Response("Sample data added successfully!", { status: 200 });
  } catch (err) {
    return new Response("Error adding sample data", { status: 500 });
  }
}