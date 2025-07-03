import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { productUrl, targetPrice, email } = await req.json();

  // Validate inputs
  if (
    !productUrl ||
    !productUrl.startsWith("http") ||
    !targetPrice ||
    isNaN(targetPrice) ||
    !email ||
    !email.includes("@")
  ) {
    console.error("❌ Invalid data:", { productUrl, targetPrice, email });
    return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
  }

  await addDoc(collection(db, "alerts"), {
    productUrl,
    targetPrice,
    email,
    createdAt: serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
