import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
import { readDatabaseConfig } from './institute-provisioning-common.mjs';

const connection = await mysql.createConnection(readDatabaseConfig(process.env));
try {
  const directory = path.join(process.cwd(), 'database', 'migrations');
  const files = (await fs.readdir(directory)).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
  const [rows] = await connection.query('SELECT migration_name, sha256, applied_at FROM institute_schema_migrations ORDER BY migration_name');
  const applied = new Map(rows.map((row) => [row.migration_name, row]));
  const migrations = [];
  for (const file of files) {
    const sql = await fs.readFile(path.join(directory, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const row = applied.get(file);
    migrations.push({ name: file, applied: Boolean(row), checksumMatches: Boolean(row && row.sha256 === checksum), appliedAt: row?.applied_at ?? null });
  }
  const [[rateLimitTable]] = await connection.query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'institute_rate_limits'");
  const [[courseEnquiryTable]] = await connection.query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'institute_course_enquiries'");
  const ready = migrations.every((migration) => migration.applied && migration.checksumMatches) && Number(rateLimitTable.count) === 1 && Number(courseEnquiryTable.count) === 1;
  process.stdout.write(`${JSON.stringify({ database: process.env.INSTITUTE_DB_NAME, readyForCourseEnquiries: ready, migration004Applied: migrations.find((entry) => entry.name === '004_institute_ip_independent_security.sql')?.applied === true, migration005Applied: migrations.find((entry) => entry.name === '005_institute_course_enquiries.sql')?.applied === true, rateLimitTablePresent: Number(rateLimitTable.count) === 1, courseEnquiryTablePresent: Number(courseEnquiryTable.count) === 1, migrations }, null, 2)}\n`);
  if (!ready) process.exitCode = 1;
} finally { await connection.end(); }
