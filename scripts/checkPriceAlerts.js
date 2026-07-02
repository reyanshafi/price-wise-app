import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import nodemailer from "nodemailer";
import { db } from "../src/lib/firebase.js";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { scrapeAmazonViaSerpApi, scrapeFlipkartDirect, scrapeViaSerpApi } from "../src/lib/scraper/serpApiScraper.js";

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function checkAlerts() {
  console.log("🔍 Checking price alerts...");

  try {
    // 1. Fetch active alerts
    const alertsRef = collection(db, "alerts");
    const q = query(alertsRef, where("isActive", "==", true), where("notificationSent", "==", false));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("ℹ️ No active alerts found.");
      return;
    }

    const activeAlerts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📋 Found ${activeAlerts.length} active alerts to process.`);

    // 2. Process each alert
    for (const alert of activeAlerts) {
      const { id, productTitle, productUrl, targetPrice, email, platform, currentPrice: oldPrice } = alert;
      
      console.log(`\n⏳ Checking alert for: ${productTitle} (Target: ₹${targetPrice})`);

      try {
        // Fetch current products matching the title
        // We use the scraping functions imported from serpApiScraper
        let allProducts = [];
        const isAmazon = platform?.toLowerCase().includes('amazon');
        const isFlipkart = platform?.toLowerCase().includes('flipkart');

        if (isAmazon) {
          allProducts = await scrapeAmazonViaSerpApi(productTitle, 3).catch(() => []);
        } else if (isFlipkart) {
          allProducts = await scrapeFlipkartDirect(productTitle, 3).catch(() => []);
        } else {
          allProducts = await scrapeViaSerpApi(productTitle, 5).catch(() => []);
        }
        
        // Find the best matching product (prioritize exact URL match, fallback to platform match)
        let matchedProduct = allProducts.find(p => p.link && productUrl && (p.link.includes(productUrl) || productUrl.includes(p.link)));
        
        if (!matchedProduct && platform) {
          matchedProduct = allProducts.find(p => p.platform && p.platform.toLowerCase() === platform.toLowerCase());
        }
        
        // Final fallback to the first result if it looks close enough
        if (!matchedProduct && allProducts.length > 0) {
            matchedProduct = allProducts[0];
        }

        if (matchedProduct) {
          const livePrice = matchedProduct.price;
          console.log(`✅ Live price found: ₹${livePrice} (Target: ₹${targetPrice})`);

          if (livePrice <= targetPrice) {
            console.log(`🎯 Price drop detected! Sending email to ${email}...`);
            
            // Send Email
            await sendPriceDropEmail(email, productTitle, productUrl, livePrice, targetPrice, matchedProduct.image, platform);

            // Update Firestore
            const alertDocRef = doc(db, "alerts", id);
            await updateDoc(alertDocRef, {
              isActive: false,
              notificationSent: true,
              triggeredAt: new Date(),
              triggeredPrice: livePrice
            });

            console.log(`📧 Email sent and alert ${id} marked as triggered.`);
          } else {
            console.log(`❌ Price is still too high. Will check again later.`);
          }
        } else {
          console.log(`⚠️ Could not find live price for product right now.`);
        }
      } catch (err) {
        console.error(`Error processing alert for ${productTitle}:`, err.message);
      }
    }
    
    console.log("🏁 All alerts processed");
  } catch (error) {
    console.error("❌ Fatal error in checkAlerts:", error);
  }
}

async function sendPriceDropEmail(toEmail, title, url, livePrice, targetPrice, imageUrl, platform) {
  const mailOptions = {
    from: `"PriceWise Alerts" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🚨 Price Drop Alert: ${title.substring(0, 30)}...`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Price Drop Alert! 🎉</h2>
          <p style="color: #6b7280; margin-top: 5px;">A product you're tracking has reached your target price.</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
          ${imageUrl ? `<img src="${imageUrl}" alt="Product" style="max-height: 150px; margin-bottom: 15px;" />` : ''}
          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px;">${title}</h3>
          
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
            <div style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Target Price</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">₹${targetPrice.toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Current Price</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #16a34a;">₹${livePrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${url}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-bottom: 10px;">
            Buy Now on ${platform || 'Store'}
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
            You received this email because you set a price alert on PriceWise.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
