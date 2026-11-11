import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const required = ['INSTITUTE_DB_HOST', 'INSTITUTE_DB_PORT', 'INSTITUTE_DB_NAME', 'INSTITUTE_DB_USER', 'INSTITUTE_DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]?.trim()) throw new Error(`Missing required server-only database setting: ${key}`);
}

const connection = await mysql.createConnection({
  host: process.env.INSTITUTE_DB_HOST, port: Number(process.env.INSTITUTE_DB_PORT), database: process.env.INSTITUTE_DB_NAME,
  user: process.env.INSTITUTE_DB_USER, password: process.env.INSTITUTE_DB_PASSWORD, charset: 'utf8mb4', timezone: 'Z', multipleStatements: true,
  ...(process.env.INSTITUTE_DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
});

try {
  const [[lock]] = await connection.query("SELECT GET_LOCK('techromz_institute_migrations', 10) AS acquired");
  if (lock.acquired !== 1) throw new Error('Could not acquire the Institute migration lock.');
  await connection.query(`CREATE TABLE IF NOT EXISTS institute_schema_migrations (
    migration_name VARCHAR(190) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const directory = path.join(process.cwd(), 'database', 'migrations');
  const files = (await fs.readdir(directory)).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
  for (const file of files) {
    const sql = await fs.readFile(path.join(directory, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const [rows] = await connection.execute('SELECT sha256 FROM institute_schema_migrations WHERE migration_name = ?', [file]);
    if (rows[0]) {
      if (rows[0].sha256 !== checksum) throw new Error(`Applied migration was modified: ${file}`);
      continue;
    }
    await connection.query(sql);
    await connection.execute('INSERT INTO institute_schema_migrations (migration_name, sha256) VALUES (?, ?)', [file, checksum]);
    process.stdout.write(`Applied ${file}\n`);
  }
} finally {
  try { await connection.query("SELECT RELEASE_LOCK('techromz_institute_migrations')"); } finally { await connection.end(); }
}
