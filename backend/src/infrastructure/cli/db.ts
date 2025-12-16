import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { loadConfig } from '@config/index.js';

const { Pool } = pg;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  name: string;
  sql: string;
}

async function createMigrationsTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(pool: pg.Pool): Promise<string[]> {
  const result = await pool.query<{ name: string }>(
    'SELECT name FROM migrations ORDER BY applied_at'
  );
  return result.rows.map((row) => row.name);
}

async function loadMigrationFiles(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, '../../../migrations');
  const files = await fs.readdir(migrationsDir);
  
  const migrationFiles = files
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const migrations: Migration[] = [];
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = await fs.readFile(filePath, 'utf-8');
    migrations.push({ name: file, sql });
  }

  return migrations;
}

async function applyMigration(
  pool: pg.Pool,
  migration: Migration
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log(`Applying migration: ${migration.name}`);
    await client.query(migration.sql);
    
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migration.name]
    );
    
    await client.query('COMMIT');
    console.log(`✓ Migration applied: ${migration.name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations(): Promise<void> {
  const config = loadConfig();
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
  });

  try {
    console.log('Starting database migrations...\n');
    
    await createMigrationsTable(pool);
    const appliedMigrations = await getAppliedMigrations(pool);
    const allMigrations = await loadMigrationFiles();

    const pendingMigrations = allMigrations.filter(
      (migration) => !appliedMigrations.includes(migration.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s):\n`);
    
    for (const migration of pendingMigrations) {
      await applyMigration(pool, migration);
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function runSeeds(): Promise<void> {
  const config = loadConfig();
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
  });

  try {
    console.log('Starting database seeding...\n');
    
    const seedsDir = path.join(__dirname, '../../../migrations/seeds');
    const files = await fs.readdir(seedsDir);
    const seedFiles = files.filter((file) => file.endsWith('.sql')).sort();

    if (seedFiles.length === 0) {
      console.log('No seed files found.');
      return;
    }

    for (const file of seedFiles) {
      console.log(`Running seed: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      await pool.query(sql);
      console.log(`✓ Seed applied: ${file}`);
    }

    console.log('\n✓ All seeds completed successfully!');
  } catch (error) {
    console.error('\n✗ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI Handler
const command = process.argv[2];

if (command === 'migrate') {
  runMigrations().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else if (command === 'seed') {
  runSeeds().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  console.log('Usage:');
  console.log('  pnpm db:migrate  - Run database migrations');
  console.log('  pnpm db:seed     - Seed the database');
  process.exit(1);
}
