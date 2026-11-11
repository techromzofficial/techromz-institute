import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');

export function readDatabaseConfig(environment = process.env) {
  const required = ['INSTITUTE_DB_HOST', 'INSTITUTE_DB_PORT', 'INSTITUTE_DB_NAME', 'INSTITUTE_DB_USER', 'INSTITUTE_DB_PASSWORD'];
  for (const key of required) if (!environment[key]?.trim()) throw new Error(`Missing required server-only database setting: ${key}`);
  const port = Number(environment.INSTITUTE_DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INSTITUTE_DB_PORT must be a valid TCP port.');
  const ssl = (environment.INSTITUTE_DB_SSL || 'false').toLowerCase();
  if (!['true', 'false'].includes(ssl)) throw new Error('INSTITUTE_DB_SSL must be true or false.');
  return { host: environment.INSTITUTE_DB_HOST, port, database: environment.INSTITUTE_DB_NAME, user: environment.INSTITUTE_DB_USER, password: environment.INSTITUTE_DB_PASSWORD,
    connectTimeout: 10_000, charset: 'utf8mb4', timezone: 'Z', ...(ssl === 'true' ? { ssl: { rejectUnauthorized: true } } : {}) };
}

export async function readAuthorization(file) {
  if (!file) throw new Error('--authorization-file is required for an apply operation.');
  const value = JSON.parse(await fs.readFile(file, 'utf8'));
  if (typeof value.approvedBy !== 'string' || value.approvedBy.trim().length < 3 || typeof value.changeTicket !== 'string' || value.changeTicket.trim().length < 3 || Number.isNaN(Date.parse(value.approvedAt))) throw new Error('Authorization file requires approvedBy, approvedAt and changeTicket.');
  return { approvedBy: value.approvedBy.trim(), approvedAt: value.approvedAt, changeTicket: value.changeTicket.trim() };
}

export function argument(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }
export function applying() { return process.argv.includes('--apply'); }
export async function connect() { return mysql.createConnection(readDatabaseConfig()); }
