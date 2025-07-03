import { db } from "../src/lib/firebase.js";
import dotenv from "dotenv";
dotenv.config();

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { scrapeAmazon } from "../src/lib/scraper/amazonScraper.js";
import nodemailer from "nodemailer";

// ✅ Setup Gmail transport using env variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password if 2FA enabled
  },
});

// ✅ Send alert email
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Price Wise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw err;
  }
}

// ✅ Save price snapshot for trend graph
export async function updatePriceHistory(productUrl, price) {
  const encodedUrl = encodeURIComponent(productUrl);
  const ref = doc(db, "price-history", encodedUrl);

  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data().history || [] : [];

  const now = new Date();
  const newEntry = {
    timestamp: now.toISOString(),
    price,
  };

  const updated = [...existing, newEntry].slice(-50); // Limit to 50 entries (optional)

  await setDoc(ref, { history: updated });
}

// ✅ Main check function
export async function checkAlerts() {
  const alertsRef = collection(db, "alerts");
  const snapshot = await getDocs(alertsRef);

  console.log(`🔍 Checking ${snapshot.size} alerts...`);

  for (const alertDoc of snapshot.docs) {
    const { productUrl, targetPrice, email } = alertDoc.data();
    console.log(`\n🔎 Checking alert for: ${productUrl}`);

    try {
      const scrapedProducts = await scrapeAmazon(productUrl);
      const current = scrapedProducts?.[0];

      if (!current || !current.price) {
        console.warn("⚠️ No valid product data found.");
        continue;
      }

      const { price, title, link } = current;

      console.log(`💰 Current price: ₹${price} | Target: ₹${targetPrice}`);

      // 🟡 Update price history in Firestore
      await updatePriceHistory(productUrl, price, title);

      // 🟢 Send email if price has dropped
      if (price <= targetPrice) {
        await sendEmail(
          email,
          "🎉 Price Drop Alert!",
          `
            <h3>${title}</h3>
            <p>The price has dropped to <strong>₹${price}</strong> (Your target: ₹${targetPrice})</p>
            <p><a href="${link}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#10b981;color:white;text-decoration:none;border-radius:6px;">Buy Now</a></p>
          `
        );

        await deleteDoc(doc(db, "alerts", alertDoc.id));
        console.log(`✅ Alert sent and deleted for ${email}`);
      } else {
        console.log(`ℹ️ No drop for "${title}"`);
      }
    } catch (err) {
      console.error(`❌ Error checking alert (${productUrl}):`, err.message);
    }
  }

  console.log("🏁 All alerts processed");
}
