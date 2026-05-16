#!/usr/bin/env node
/**
 * Supabase Database Setup Script
 * 
 * This script connects DIRECTLY to your Supabase Postgres database
 * and executes the schema SQL to create all tables, policies, and seed data.
 * 
 * You need:
 * 1. Your Supabase Database Connection String (URI)
 *    Get it from: Supabase Dashboard → Project Settings → Database → Connection String (URI)
 * 2. Your SUPABASE_SERVICE_ROLE_KEY (for RLS setup)
 * 
 * Usage:
 *   node scripts/setup-database.ts
 *   Or with a specific connection string:
 *   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" node scripts/setup-database.ts
 */

import { Client } from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is required.");
  console.error("");
  console.error("Get your connection string from:");
  console.error("  1. Go to https://supabase.com/dashboard");
  console.error("  2. Select your project");
  console.error("  3. Go to Project Settings → Database");
  console.error("  4. Copy the 'URI' connection string");
  console.error("  5. Replace [YOUR-PASSWORD] with your actual database password");
  console.error("");
  console.error("Then run:");
  console.error("  DATABASE_URL=\"postgresql://...\" node scripts/setup-database.ts");
  process.exit(1);
}

// ============================================================================
// MAIN SETUP
// ============================================================================

async function setupDatabase() {
  console.log("🚀 AJ247 Studios — Database Setup");
  console.log("=================================\n");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase connections
  });

  try {
    console.log("📡 Connecting to Supabase database...");
    await client.connect();
    console.log("✅ Connected successfully!\n");

    // Read the schema SQL
    const schemaPath = join(__dirname, "..", "supabase", "schema-booking-platform.sql");
    let schemaSQL: string;
    
    try {
      schemaSQL = readFileSync(schemaPath, "utf-8");
      console.log("📄 Loaded schema file:");
      console.log(`   ${schemaPath}`);
      console.log(`   Size: ${(schemaSQL.length / 1024).toFixed(1)} KB\n`);
    } catch (err) {
      console.error("❌ Could not read schema file. Make sure it exists at:");
      console.error(`   ${schemaPath}`);
      process.exit(1);
    }

    // Execute the schema
    console.log("🔨 Executing schema...\n");
    await client.query(schemaSQL);

    // Verify tables were created
    console.log("🔍 Verifying tables...");
    const tables = [
      "employee_profiles",
      "service_packages", 
      "employee_pricing",
      "bookings",
      "messages",
      "employee_portfolio_items",
      "project_updates",
    ];

    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      const exists = result.rows[0].exists;
      console.log(`   ${exists ? "✅" : "❌"} ${table}`);
    }

    // Verify seed data
    console.log("\n📊 Verifying seed data...");
    const packageCount = await client.query("SELECT COUNT(*) FROM service_packages");
    console.log(`   ✅ ${packageCount.rows[0].count} service packages inserted`);

    console.log("\n🎉 Database setup complete!");
    console.log("=================================");
    console.log("\nNext steps:");
    console.log("  1. Set up employee profiles (run from Supabase Dashboard)");
    console.log("  2. Deploy the updated website");
    console.log("  3. Test the booking flow\n");

  } catch (err: any) {
    console.error("\n❌ Setup failed!");
    console.error("Error:", err.message);
    
    if (err.message.includes("password authentication failed")) {
      console.error("\n💡 Hint: Check your database password in the connection string.");
    } else if (err.message.includes("getaddrinfo")) {
      console.error("\n💡 Hint: Check your project reference in the connection string.");
    } else if (err.message.includes("already exists")) {
      console.error("\n💡 Hint: Tables already exist. The schema uses IF NOT EXISTS, so this may be safe.");
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
