// scripts/trigger.js
import { checkAlerts } from "./checkPriceAlerts.js";

(async () => {
  console.log("🚀 Manually triggering price alert check...");
  await checkAlerts();
  console.log("✅ Done.");
})();
