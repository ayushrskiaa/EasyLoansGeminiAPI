import { config } from "dotenv";
import { seedDatabase } from "../lib/db/seed";

config();

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL is not set in environment variables");
      console.error("Please check your .env file and ensure DATABASE_URL is set.");
      process.exit(1);
    }
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();

