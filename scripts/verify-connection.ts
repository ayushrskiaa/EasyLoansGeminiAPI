import postgres from "postgres";
import { config } from "dotenv";

// Load environment variables from .env file
config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.error("Please check your .env file and ensure DATABASE_URL is set.");
  process.exit(1);
}

async function verifyConnection() {
  console.log("🔍 Verifying database connection...\n");

  let client: ReturnType<typeof postgres> | null = null;

  try {
    // Test connection
    console.log("1. Testing connection...");
    client = postgres(process.env.DATABASE_URL!);
    
    // Simple query to test connection
    const result = await client`SELECT version() as version, current_database() as database, current_user as user`;
    
    console.log("✅ Connection successful!");
    console.log(`   Database: ${result[0].database}`);
    console.log(`   User: ${result[0].user}`);
    console.log(`   PostgreSQL Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}\n`);

    // Check if tables exist
    console.log("2. Checking tables...");
    const tables = await client<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const expectedTables = ['products', 'users', 'ai_chat_messages'];
    const existingTables = tables.map((t) => t.table_name);

    console.log(`   Found ${tables.length} table(s):`);
    tables.forEach((table) => {
      const isExpected = expectedTables.includes(table.table_name);
      console.log(`   ${isExpected ? '✅' : '⚠️ '} ${table.table_name}`);
    });

    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log(`\n   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log("   Run: npm run db:migrate:manual");
    } else {
      console.log("\n   ✅ All required tables exist!");
    }

    // Check if products table has data
    if (existingTables.includes('products')) {
      console.log("\n3. Checking products data...");
      const productCount = await client`SELECT COUNT(*) as count FROM products`;
      const count = Number(productCount[0].count);
      
      if (count > 0) {
        console.log(`   ✅ Found ${count} product(s) in database`);
      } else {
        console.log("   ⚠️  No products found. Run: npm run db:seed");
      }
    }

    // Check if users table exists
    if (existingTables.includes('users')) {
      console.log("\n4. Checking users table...");
      const userCount = await client`SELECT COUNT(*) as count FROM users`;
      const count = Number(userCount[0].count);
      console.log(`   ✅ Users table ready (${count} user(s))`);
    }

    // Check enum types
    console.log("\n5. Checking enum types...");
    const enums = await client<{ typname: string }[]>`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typname IN ('loan_type', 'role')
    `;
    
    const enumNames = enums.map((e) => e.typname);
    if (enumNames.includes('loan_type') && enumNames.includes('role')) {
      console.log("   ✅ All enum types exist!");
    } else {
      console.log("   ⚠️  Some enum types missing. Run: npm run db:migrate:manual");
    }

    console.log("\n✅ Database connection verified successfully!");
    console.log("   Your Supabase database is ready to use.\n");

  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error instanceof Error ? error.message : error);
    console.log("\nTroubleshooting:");
    console.log("1. Check your DATABASE_URL in .env file");
    console.log("2. Verify your Supabase project is active");
    console.log("3. Ensure your database password is correct");
    console.log("4. Check if your IP is allowed (Supabase free tier allows all IPs)");
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

verifyConnection();

