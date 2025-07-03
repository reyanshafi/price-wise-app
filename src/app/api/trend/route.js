// /app/api/trend/route.js
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productUrl = searchParams.get("productUrl");

  if (!productUrl) {
    return new Response("Missing productUrl", { status: 400 });
  }

  try {
    const encodedUrl = encodeURIComponent(productUrl);
    const ref = doc(db, "price-history", encodedUrl);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return new Response(JSON.stringify({ trend: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { title, history } = snapshot.data();
    return new Response(JSON.stringify({ title, history }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Failed to fetch trend:", err.message);
    return new Response("Server error", { status: 500 });
  }
}
