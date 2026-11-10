import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import mysql from 'mysql2/promise';
import { readDatabaseConfig } from './institute-provisioning-common.mjs';

const COURSE = 'Electronics Repair & Troubleshooting';
const RECIPIENT = 'enrolments@techromzit.com';
const args = process.argv.slice(2);
if (args.some((value) => !['--dry-run', '--send'].includes(value)) || (args.includes('--dry-run') && args.includes('--send'))) throw new Error('Use either --dry-run or --send.');
const send = args.includes('--send');

if (!send) {
  process.stdout.write(`${JSON.stringify({ mode: 'dry-run', course: COURSE, fixedRecipient: RECIPIENT, originSource: 'NEXT_PUBLIC_APP_URL', checksDatabaseMigrations: ['001', '002', '003', '004', '005', '006'], checksEndpointReadiness: true, requiresContactVerification: true, requiresInteractiveConfirmation: true, sendsEmail: false }, null, 2)}\n`);
  process.exit(0);
}
if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('The course enquiry end-to-end test requires an interactive TTY.');

const origin = validatedOrigin(process.env.NEXT_PUBLIC_APP_URL);
await assertDatabaseReady();
const endpoint = new URL('/api/institute/course-enquiries', origin);
const headers = { Origin: origin.origin, 'Sec-Fetch-Site': 'same-origin' };
const readiness = await fetch(endpoint, { headers, cache: 'no-store' });
const readinessBody = await readiness.json().catch(() => ({}));
if (!readiness.ok || readinessBody.available !== true) throw new Error('Course enquiry endpoint is not ready. Verify server-only SMTP, database, abuse-protection and allowed-host configuration.');

const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
let verificationGrant;
try {
  const phrase = `SEND ${COURSE} TEST TO ${RECIPIENT}`;
  const confirmation = (await terminal.question(`Type ${phrase} to authorize one verification email and one enquiry notification: `)).trim();
  if (confirmation !== phrase) throw new Error('Course enquiry end-to-end test cancelled: confirmation did not match.');
  const challengeResponse = await fetch(new URL('/api/institute/contact-verification/challenge', origin), {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'email', destination: RECIPIENT, purpose: 'course_enquiry' }),
  });
  const challenge = await challengeResponse.json().catch(() => ({}));
  if (challengeResponse.status !== 202 || challenge.accepted !== true) throw new Error(`Verification challenge was not accepted (${challengeResponse.status}).`);
  const cookie = challengeResponse.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw new Error('Enquiry session cookie was not issued.');
  headers.Cookie = cookie;
  const token = (await terminal.question(`Enter the six-digit verification code delivered to ${RECIPIENT}: `)).trim();
  if (!/^\d{6}$/.test(token)) throw new Error('A six-digit verification code is required.');
  const verificationResponse = await fetch(new URL('/api/institute/contact-verification/verify', origin), {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId: challenge.challengeId, token, purpose: 'course_enquiry' }),
  });
  const verification = await verificationResponse.json().catch(() => ({}));
  if (!verificationResponse.ok || verification.verified !== true) throw new Error('Contact verification failed.');
  verificationGrant = verification.verificationGrant;
} finally { terminal.close(); }

const response = await fetch(endpoint, {
  method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'Techromz Institute Controlled Test', email: RECIPIENT, phone: '', courseId: 'electronics-repair-troubleshooting', subject: 'Controlled SMTP test', courseName: COURSE, message: 'Controlled Hostinger activation test for the course enquiry service. No response is required.', website: '', verificationGrant, idempotencyKey: crypto.randomUUID() }),
});
const body = await response.json().catch(() => ({}));
if (response.status !== 202 || body.accepted !== true) throw new Error(`Course enquiry test was not accepted (${response.status}): ${body.message ?? 'unknown response'}`);
process.stdout.write(`Saved and queued one controlled ${COURSE} enquiry for ${RECIPIENT}. Run the delivery worker, inspect notification status, then verify inbox and spam-folder receipt manually.\n`);

async function assertDatabaseReady() {
  const connection = await mysql.createConnection(readDatabaseConfig(process.env));
  try {
    const directory = path.join(process.cwd(), 'database', 'migrations');
    for (const file of (await fs.readdir(directory)).filter((entry) => /^\d+.*\.sql$/.test(entry)).sort()) {
      const checksum = crypto.createHash('sha256').update(await fs.readFile(path.join(directory, file), 'utf8')).digest('hex');
      const [rows] = await connection.execute('SELECT sha256 FROM institute_schema_migrations WHERE migration_name = ?', [file]);
      if (!rows[0] || rows[0].sha256 !== checksum) throw new Error(`Database migration is missing or has a checksum mismatch: ${file}`);
    }
    const [tables] = await connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('institute_rate_limits','institute_course_enquiries')");
    if (new Set(tables.map((row) => row.table_name)).size !== 2) throw new Error('Required course-enquiry tables are missing.');
  } finally { await connection.end(); }
}

function validatedOrigin(value) {
  if (!value) throw new Error('NEXT_PUBLIC_APP_URL is required for the end-to-end test.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('NEXT_PUBLIC_APP_URL must be an HTTPS origin without credentials, path, query or fragment.');
  const allowed = new Set((process.env.INSTITUTE_ALLOWED_HOSTS ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean));
  if (!allowed.has(url.hostname.toLowerCase())) throw new Error('NEXT_PUBLIC_APP_URL hostname is not present in INSTITUTE_ALLOWED_HOSTS.');
  return url;
}
