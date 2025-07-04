import { checkPriceAlerts } from "../src/app/api/check-price-alerts/route.js";
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

// Enhanced Price Alert Checker with new system
async function runPriceAlertCheck() {
  console.log('🔔 Starting scheduled price alert check...');
  console.log('📅 Time:', new Date().toISOString());
  
  try {
    // Run new price alert system
    console.log('🆕 Running new price alert system...');
    const results = await checkPriceAlerts();
    
    console.log('✅ New system check completed');
    console.log(`📊 Results: ${results.triggered} notifications sent out of ${results.checked} checks`);
    
    if (results.triggered > 0) {
      console.log('🎯 Triggered alerts:');
      results.notifications.forEach(notification => {
        console.log(`  - ${notification.productTitle}: ₹${notification.currentPrice} (saved ₹${notification.savings})`);
      });
    }
    
    // Also run legacy Firebase checks for backward compatibility
    console.log('🔄 Running legacy Firebase price checks...');
    await runLegacyPriceChecks();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Price alert check failed:', error);
    process.exit(1);
  }
}

// Legacy Firebase-based price checking (keeping for backward compatibility)
async function runLegacyPriceChecks() {
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
  async function updatePriceHistory(productUrl, price) {
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
  async function checkAlerts() {
    const alertsRef = collection(db, "alerts");
    const snapshot = await getDocs(alertsRef);

    console.log(`🔍 Checking ${snapshot.size} legacy Firebase alerts...`);

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

        console.log(`💰 Current: ₹${current.price}, Target: ₹${targetPrice}`);

        // ✅ Save price history
        await updatePriceHistory(productUrl, current.price);

        if (current.price <= targetPrice) {
          console.log("🎯 TARGET REACHED! Sending email...");

          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🎯 Price Alert!</h1>
              </div>
              
              <div style="padding: 20px; background: #f8f9fa;">
                <h2>Your target price has been reached!</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>${current.title}</h3>
                  <p><strong>Current Price:</strong> ₹${current.price}</p>
                  <p><strong>Your Target:</strong> ₹${targetPrice}</p>
                  <p><strong>You Save:</strong> ₹${targetPrice - current.price}</p>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${productUrl}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                      🛒 Buy Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `;

          await sendEmail(
            email,
            `🎯 Price Alert: ${current.title}`,
            html
          );

          // ✅ Delete alert after triggering
          await deleteDoc(alertDoc.ref);
          console.log("✅ Alert deleted");
        } else {
          console.log("⏳ Target not reached yet");
        }
      } catch (err) {
        console.error(`❌ Error checking ${productUrl}:`, err.message);
      }

      // ✅ Rate limiting (2 seconds between checks)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Run legacy checks
  try {
    await checkAlerts();
    console.log("✅ Legacy price check completed!");
  } catch (error) {
    console.error("❌ Legacy price check failed:", error);
  }
}

// ✅ Main execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runPriceAlertCheck();
}

export { runPriceAlertCheck, runLegacyPriceChecks };
