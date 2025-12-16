import pg from 'pg';
import { loadConfig } from '@config/index.js';
import { createLogger } from '@shared/logger.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function createDatabasePool(): pg.Pool {
  if (pool) {
    return pool;
  }

  const config = loadConfig();
  const logger = createLogger(config);

  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if unable to connect
  });

  pool.on('connect', () => {
    logger.debug('New database connection established');
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected database pool error');
  });

  return pool;
}

export function getDatabasePool(): pg.Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createDatabasePool() first.');
  }
  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const dbPool = getDatabasePool();
    const result = await dbPool.query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}
