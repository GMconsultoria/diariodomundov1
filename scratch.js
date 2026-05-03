import { getDashboardStats } from "./server/db.js";

async function run() {
  try {
    const stats = await getDashboardStats();
    console.log("Stats:", JSON.stringify(stats, null, 2));
  } catch(e) {
    console.error(e);
  }
}

run();
