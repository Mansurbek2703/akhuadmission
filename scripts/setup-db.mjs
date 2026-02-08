import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { hash } from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/admissions";

async function setupDatabase() {
  console.log("=================================================");
  console.log("  Al-Xorazmiy University - Database Setup");
  console.log("=================================================\n");

  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    // Test connection
    console.log("[1/4] Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("  -> Connected to PostgreSQL successfully!\n");

    // Run schema SQL
    console.log("[2/4] Creating database schema...");
    const sqlPath = join(__dirname, "setup-db.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("  -> All tables and indexes created!\n");

    // Add new columns to notifications (safe migration for existing databases)
    console.log("[2.5/4] Running migrations...");
    try {
      await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'general'`);
      await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS changed_fields JSONB`);
      console.log("  -> Migrations applied!\n");
    } catch {
      console.log("  -> Migrations already applied or skipped.\n");
    }

    // Create default superadmin
    console.log("[3/4] Creating default superadmin account...");
    const superadminEmail = "admin@alxorazmiy.uz";
    const superadminPassword = "admin123!";
    const passwordHash = await hash(superadminPassword, 12);

    const existingSuperadmin = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [superadminEmail]
    );

    if (existingSuperadmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, role, email_verified)
         VALUES ($1, $2, 'superadmin', TRUE)`,
        [superadminEmail, passwordHash]
      );
      console.log(`  -> Superadmin created: ${superadminEmail}`);
    } else {
      console.log("  -> Superadmin already exists, skipping...");
    }

    // Create default admin
    const adminEmail = "reviewer@alxorazmiy.uz";
    const adminPassword = "admin123!";
    const adminHash = await hash(adminPassword, 12);

    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, role, email_verified)
         VALUES ($1, $2, 'admin', TRUE)`,
        [adminEmail, adminHash]
      );
      console.log(`  -> Admin created: ${adminEmail}\n`);
    } else {
      console.log("  -> Admin already exists, skipping...\n");
    }

    // Summary
    console.log("[4/4] Setup complete!\n");
    console.log("=================================================");
    console.log("  DATABASE SETUP COMPLETED SUCCESSFULLY!");
    console.log("=================================================\n");
    console.log("  Default login credentials:");
    console.log("  ---------------------------");
    console.log(`  Superadmin: ${superadminEmail} / ${superadminPassword}`);
    console.log(`  Admin:      ${adminEmail} / ${adminPassword}`);
    console.log("");
    console.log("  Next steps:");
    console.log("  1. Run: npm run dev");
    console.log("  2. Open: http://localhost:3000");
    console.log("  3. Login with the credentials above");
    console.log("  4. Create applicant accounts via /register");
    console.log("=================================================\n");
  } catch (error) {
    console.error("\n[ERROR] Database setup failed:");
    console.error(error.message);
    console.error("\nMake sure:");
    console.error("  1. PostgreSQL is running on your local machine");
    console.error('  2. Database "admissions" exists');
    console.error("  3. DATABASE_URL environment variable is correct");
    console.error(
      "\n  To create the database, run:"
    );
    console.error("  psql -U postgres -c 'CREATE DATABASE admissions;'");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
