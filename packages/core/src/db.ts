import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const defaultDbPath = path.resolve(process.cwd(), "data", "leadscore.db");

export function getDbPath(): string {
  return process.env.LEADSCORE_DB_PATH
    ? path.resolve(process.env.LEADSCORE_DB_PATH)
    : defaultDbPath;
}

export function createDb(): DatabaseSync {
  const dbPath = getDbPath();
  const parentDir = path.dirname(dbPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS click_sessions (
      session_id TEXT PRIMARY KEY,
      landing_url TEXT NOT NULL,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      ad_id TEXT,
      adset_id TEXT,
      campaign_id TEXT,
      creative_id TEXT,
      campaign_name TEXT,
      adset_name TEXT,
      creative_name TEXT,
      xcod TEXT,
      fbclid TEXT,
      gclid TEXT,
      ttclid TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkout_intents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      email TEXT,
      checkout_url TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(session_id) REFERENCES click_sessions(session_id)
    );

    CREATE TABLE IF NOT EXISTS hotmart_purchases (
      transaction_id TEXT PRIMARY KEY,
      buyer_email TEXT NOT NULL,
      buyer_name TEXT,
      status TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      event TEXT NOT NULL,
      approved_at INTEGER,
      source_session_id TEXT,
      attribution_source TEXT,
      created_at INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      FOREIGN KEY(source_session_id) REFERENCES click_sessions(session_id)
    );

    CREATE TABLE IF NOT EXISTS survey_responses (
      email TEXT PRIMARY KEY,
      first_name TEXT,
      experience TEXT NOT NULL,
      language_skill TEXT NOT NULL,
      english_level TEXT NOT NULL,
      has_international_interview TEXT NOT NULL,
      international_interest TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      help_text TEXT NOT NULL,
      test_email TEXT,
      form_id TEXT,
      form_name TEXT,
      raw_body_json TEXT,
      lead_score INTEGER NOT NULL,
      lead_qualification TEXT NOT NULL,
      submitted_at INTEGER NOT NULL
    );
  `);

  ensureColumn(db, "click_sessions", "campaign_name", "TEXT");
  ensureColumn(db, "click_sessions", "adset_name", "TEXT");
  ensureColumn(db, "click_sessions", "creative_name", "TEXT");
  ensureColumn(db, "click_sessions", "xcod", "TEXT");
  ensureColumn(db, "hotmart_purchases", "attribution_source", "TEXT");
  ensureColumn(db, "survey_responses", "first_name", "TEXT");
  ensureColumn(db, "survey_responses", "test_email", "TEXT");
  ensureColumn(db, "survey_responses", "form_id", "TEXT");
  ensureColumn(db, "survey_responses", "form_name", "TEXT");
  ensureColumn(db, "survey_responses", "raw_body_json", "TEXT");
}

function ensureColumn(
  db: DatabaseSync,
  tableName: string,
  columnName: string,
  sqlType: string
): void {
  const columns = db
    .prepare(`PRAGMA table_info(${tableName});`)
    .all() as Array<{ name: string }>;
  const alreadyExists = columns.some((column) => column.name === columnName);
  if (!alreadyExists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${sqlType};`);
  }
}
