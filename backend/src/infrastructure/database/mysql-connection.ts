import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'ticket',
    password: process.env.DB_PASSWORD ?? 'ticket',
    database: process.env.DB_NAME ?? 'tickets_db',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
  });
}

export function getPool(): Pool {
  pool ??= createPool();
  return pool;
}

export async function waitForDatabase(maxRetries = 20, delayMs = 1500): Promise<void> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const connection = await getPool().getConnection();
      connection.release();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Não foi possível conectar ao MySQL.');
}