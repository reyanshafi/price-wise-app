// scripts/trigger.js
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

import { checkAlerts } from "./checkPriceAlerts.js";

(async () => {
  console.log("🚀 Manually triggering price alert check...");
  await checkAlerts();
  console.log("✅ Done.");
})();
