import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { productUrl, targetPrice, email, productTitle, currentPrice, platform } = await req.json();

    // Validate inputs
    if (
      !productUrl ||
      !productUrl.startsWith("http") ||
      !targetPrice ||
      isNaN(targetPrice) ||
      targetPrice <= 0 ||
      !email ||
      !email.includes("@")
    ) {
      console.error("❌ Invalid data:", { productUrl, targetPrice, email });
      return NextResponse.json({ message: "Invalid input data. Please check all fields." }, { status: 400 });
    }

    // Create alert document
    const alertData = {
      productUrl,
      targetPrice: parseFloat(targetPrice),
      email,
      productTitle: productTitle || 'Product',
      currentPrice: currentPrice || 0,
      platform: platform || 'Unknown',
      createdAt: serverTimestamp(),
      isActive: true,
      notificationSent: false
    };

    await addDoc(collection(db, "alerts"), alertData);

    console.log("✅ Price alert created:", alertData);
    return NextResponse.json({ 
      success: true, 
      message: "Alert set successfully! You'll be notified when the product reaches your target price." 
    });

  } catch (error) {
    console.error("❌ Error creating alert:", error);
    return NextResponse.json({ 
      message: "Failed to create alert. Please try again." 
    }, { status: 500 });
  }
}
