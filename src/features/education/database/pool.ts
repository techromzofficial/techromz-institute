import 'server-only';
import mysql, { type Pool } from 'mysql2/promise';
import { readInstituteDatabaseConfig } from './config';

let pool: Pool | null = null;

export function getInstituteDatabasePool(): Pool {
  if (pool) return pool;
  const config = readInstituteDatabaseConfig();
  pool = mysql.createPool({
    host: config.host, port: config.port, database: config.database, user: config.user, password: config.password,
    waitForConnections: true, connectionLimit: config.connectionLimit, queueLimit: 50, enableKeepAlive: true,
    charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true,
    ...(config.ssl ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  return pool;
}

export async function checkInstituteDatabaseConnection(): Promise<{ available: true } | { available: false }> {
  try {
    const connection = await getInstituteDatabasePool().getConnection();
    try { await connection.query('SELECT 1'); } finally { connection.release(); }
    return { available: true };
  } catch {
    return { available: false };
  }
}
