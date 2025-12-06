import postgres from "postgres";
import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.error("Please check your .env file and ensure DATABASE_URL is set.");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log("Running migrations...");

    await client.unsafe(`
      DO $$ BEGIN
        CREATE TYPE loan_type AS ENUM ('personal', 'education', 'vehicle', 'home', 'credit_line', 'debt_consolidation');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.unsafe(`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'assistant');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        bank TEXT NOT NULL,
        type loan_type NOT NULL,
        rate_apr NUMERIC(5, 2) NOT NULL,
        min_income NUMERIC(12, 2) NOT NULL,
        min_credit_score INTEGER NOT NULL,
        tenure_min_months INTEGER DEFAULT 6 NOT NULL,
        tenure_max_months INTEGER DEFAULT 60 NOT NULL,
        processing_fee_pct NUMERIC(5, 2) DEFAULT 0 NOT NULL,
        prepayment_allowed BOOLEAN DEFAULT TRUE NOT NULL,
        disbursal_speed TEXT DEFAULT 'standard' NOT NULL,
        docs_level TEXT DEFAULT 'standard' NOT NULL,
        summary TEXT,
        faq JSONB DEFAULT '[]'::jsonb NOT NULL,
        terms JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        product_id UUID NOT NULL REFERENCES products(id),
        role role NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    console.log("Migrations completed successfully!");
    await client.end();
  } catch (error) {
    console.error("Error running migrations:", error);
    await client.end();
    throw error;
  }
}

migrate()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });

