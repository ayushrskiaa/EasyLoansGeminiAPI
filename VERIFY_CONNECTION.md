# How to Verify Supabase Database Connection

There are several ways to verify your Supabase database connection. Choose the method that works best for you.

## Method 1: Using the Verification Script (Recommended)

The easiest way to verify your connection is using the built-in verification script:

```bash
npm run db:verify
```

This script will:
- ✅ Test the database connection
- ✅ Show database information (name, user, PostgreSQL version)
- ✅ Check if all required tables exist
- ✅ Verify enum types are created
- ✅ Count products and users
- ✅ Provide troubleshooting tips if something is wrong

**Expected Output:**
```
🔍 Verifying database connection...

1. Testing connection...
✅ Connection successful!
   Database: postgres
   User: postgres
   PostgreSQL Version: PostgreSQL 15.x

2. Checking tables...
   Found 3 table(s):
   ✅ ai_chat_messages
   ✅ products
   ✅ users

   ✅ All required tables exist!

3. Checking products data...
   ✅ Found 12 product(s) in database

4. Checking users table...
   ✅ Users table ready (0 user(s))

5. Checking enum types...
   ✅ All enum types exist!

✅ Database connection verified successfully!
   Your Supabase database is ready to use.
```

## Method 2: Using Supabase Dashboard

1. **Go to your Supabase project dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Check Table Editor**
   - Click **Table Editor** in the left sidebar
   - You should see:
     - `products` table
     - `users` table
     - `ai_chat_messages` table

3. **Verify products are seeded**
   - Click on the `products` table
   - You should see 12 loan products
   - If empty, run: `npm run db:seed`

4. **Check Database Settings**
   - Go to **Settings** → **Database**
   - Verify your connection string matches your `.env` file

## Method 3: Using Supabase SQL Editor

1. **Open SQL Editor**
   - In Supabase dashboard, click **SQL Editor** in the left sidebar

2. **Run Test Queries**

   **Test Connection:**
   ```sql
   SELECT version(), current_database(), current_user;
   ```

   **Check Tables:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

   **Count Products:**
   ```sql
   SELECT COUNT(*) as product_count FROM products;
   ```

   **View Sample Product:**
   ```sql
   SELECT name, bank, type, rate_apr 
   FROM products 
   LIMIT 5;
   ```

## Method 4: Test Through the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Try to sign in:**
   - Go to `http://localhost:3000`
   - Sign in with any email/password (e.g., `test@example.com` / `password123`)

3. **Check if user was created:**
   - Go to Supabase dashboard → **Table Editor** → `users` table
   - You should see a new user with the email you used

4. **Check if products load:**
   - After signing in, you should see the dashboard with loan products
   - If products don't load, check the browser console for errors

## Method 5: Quick Terminal Test

You can also test the connection directly using Node.js:

```bash
node -e "const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT version()\`.then(r => { console.log('✅ Connected!', r[0]); sql.end(); }).catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });"
```

Or using PowerShell (Windows):
```powershell
$env:DATABASE_URL = (Get-Content .env | Select-String "DATABASE_URL").ToString().Split("=")[1]
node -e "const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT version()\`.then(r => { console.log('✅ Connected!', r[0]); sql.end(); }).catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });"
```

## Common Issues and Solutions

### ❌ "Connection refused" or "Timeout"

**Possible causes:**
- Incorrect connection string
- Wrong database password
- Supabase project is paused (free tier pauses after inactivity)

**Solutions:**
1. Verify your connection string in `.env`
2. Check your database password in Supabase Settings
3. If project is paused, go to Supabase dashboard and resume it

### ❌ "Password authentication failed"

**Solutions:**
1. Double-check your database password
2. Make sure there are no extra spaces in the connection string
3. Regenerate the connection string in Supabase Settings

### ❌ "Tables don't exist"

**Solution:**
```bash
npm run db:migrate:manual
```

### ❌ "No products found"

**Solution:**
```bash
npm run db:seed
```

### ❌ "DATABASE_URL is not set"

**Solution:**
1. Make sure you have a `.env` file in the project root
2. Verify it contains: `DATABASE_URL=postgresql://...`
3. Restart your development server after updating `.env`

## Verification Checklist

Before using the application, verify:

- [ ] Connection test passes (`npm run db:verify`)
- [ ] All 3 tables exist (products, users, ai_chat_messages)
- [ ] Products table has 12 sample products
- [ ] Enum types exist (loan_type, role)
- [ ] Can sign in and create users
- [ ] Products load on the dashboard

## Next Steps

Once verification is complete:

1. ✅ Your database is ready
2. ✅ You can start using the application
3. ✅ Users will be stored in the database
4. ✅ Products are available for display
5. ✅ AI chat will work (once you add Google AI API key)

## Need Help?

If verification fails:
1. Check the error message from `npm run db:verify`
2. Review the troubleshooting section above
3. Check Supabase project status in the dashboard
4. Verify your `.env` file is correct

