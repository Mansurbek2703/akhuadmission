import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/admissions",
});

let migrated = false;

async function runMigrations() {
  if (migrated) return;
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'general';
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS changed_fields JSONB;
    `);
    // Add 'submitted' to status CHECK constraint if missing
    try {
      await client.query(`
        ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
        ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN (
          'submitted', 'pending_review', 'incomplete_document', 'approved_to_attend_exam',
          'passed_with_exemption', 'application_approved'
        ));
      `);
    } catch { /* constraint already correct */ }
    migrated = true;
  } catch (e) {
    // Table may not exist yet (first run before setup-db), ignore
    console.log("[DB] Migration skipped:", (e as Error).message);
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: unknown[]) {
  await runMigrations();
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;
