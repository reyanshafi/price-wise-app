// scripts/trigger.js
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

(async () => {
  const { checkAlerts } = await import("./checkPriceAlerts.js");
  console.log("🚀 Manually triggering price alert check...");
  await checkAlerts();
  console.log("✅ Done.");
})();
