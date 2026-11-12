import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import mysql from 'mysql2/promise';
import { stagingIssues, STAGING_KEYS } from './institute-staging-config.mjs';
import { readHiddenTerminalValue } from './institute-smtp-diagnostic-lib.mjs';
import { readDatabaseConfig } from './institute-provisioning-common.mjs';

const COURSE = 'Electronics Repair & Troubleshooting';
const RECIPIENT = 'enrolments@techromzit.com';
const args = process.argv.slice(2);
if (args.some((value) => !['--dry-run', '--send'].includes(value)) || (args.includes('--dry-run') && args.includes('--send'))) throw new Error('Use either --dry-run or --send.');
const send = args.includes('--send');

if (!send) {
  process.stdout.write(`${JSON.stringify({ mode: 'dry-run', stagingOnly: true, refusesKnownProductionTargets: true, requiresApprovedRecipients: true, course: COURSE, fixedRecipient: RECIPIENT, originSource: 'NEXT_PUBLIC_APP_URL', checksDatabaseMigrations: ['001', '002', '003', '004', '005', '006'], checksEndpointReadiness: true, requiresContactVerification: true, requiresInteractiveConfirmation: true, sendsEmail: false }, null, 2)}\n`);
  process.exit(0);
}
try {
  const issues = stagingIssues(Object.fromEntries([...STAGING_KEYS].filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]])));
  if (issues.length) { console.error(JSON.stringify({ status: 'BLOCKED', issues })); throw new Error('STAGING_CONFIGURATION_REQUIRED'); }
  const testRecipient = process.env.INSTITUTE_STAGING_TEST_EMAIL;
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
    const phrase = `SEND ${COURSE} STAGING OTP TO ${testRecipient} AND NOTIFY ${RECIPIENT}`;
    const confirmation = (await terminal.question(`Type ${phrase} to authorize one verification email and one enquiry notification: `)).trim();
    if (confirmation !== phrase) throw new Error('Course enquiry end-to-end test cancelled: confirmation did not match.');
    const challengeResponse = await fetch(new URL('/api/institute/contact-verification/challenge', origin), {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'email', destination: testRecipient, purpose: 'course_enquiry', courseId: 'electronics-repair-troubleshooting' }),
    });
    const challenge = await challengeResponse.json().catch(() => ({}));
    if (challengeResponse.status !== 202 || challenge.accepted !== true) throw new Error(`Verification challenge was not accepted (${challengeResponse.status}).`);
    const cookie = challengeResponse.headers.get('set-cookie')?.split(';')[0];
    if (!cookie) throw new Error('Enquiry session cookie was not issued.');
    headers.Cookie = cookie;
    terminal.close();
    const hidden = await readHiddenTerminalValue(process.stdin, process.stdout, 'Enter the received OTP (hidden): ');
    const token = hidden.toString('utf8').trim(); hidden.fill(0);
    if (!/^\d{6}$/.test(token)) throw new Error('A six-digit verification code is required.');
    const verificationResponse = await fetch(new URL('/api/institute/contact-verification/verify', origin), {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId: challenge.challengeId, token, purpose: 'course_enquiry', courseId: 'electronics-repair-troubleshooting' }),
    });
    const verification = await verificationResponse.json().catch(() => ({}));
    if (!verificationResponse.ok || verification.verified !== true) throw new Error('Contact verification failed.');
    verificationGrant = verification.verificationGrant;
  } finally { terminal.close(); }

  const payload = { fullName: 'Techromz Institute Controlled Test', email: testRecipient, phone: '', courseId: 'electronics-repair-troubleshooting', subject: 'Controlled SMTP test', courseName: COURSE, message: 'Controlled staging course enquiry verification. No response is required.', website: '', verificationGrant, idempotencyKey: crypto.randomUUID() };
  const response = await fetch(endpoint, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (response.status !== 202 || body.accepted !== true) throw new Error(`Course enquiry test was not accepted (${response.status}): ${body.message ?? 'unknown response'}`);
  const retry = await fetch(endpoint, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const replay = await retry.json().catch(() => ({}));
  if (retry.status !== 200 || replay.duplicate !== true || replay.enquiryId !== body.enquiryId) throw new Error('STAGING_IDEMPOTENCY_NOT_VERIFIED');
  await assertStoredEnquiry(body.enquiryId, payload, headers.Cookie);
  process.stdout.write(`Verified one persisted, idempotent staged enquiry; saved and queued one controlled ${COURSE} enquiry for ${RECIPIENT}. Run the delivery worker, inspect notification status, then verify inbox and spam-folder receipt manually.\n`);
} catch { console.error('STAGING_ENQUIRY_E2E_FAILED; no success or receipt is claimed. Review approved private diagnostics.'); process.exitCode = 1; }

async function assertStoredEnquiry(enquiryId, payload, cookie) {
  const connection = await mysql.createConnection(readDatabaseConfig(process.env));
  try {
    const sessionId = decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)).split('.')[0];
    if (!/^[A-Za-z0-9_-]{43}$/.test(sessionId)) throw new Error('STAGING_SESSION_NOT_VERIFIED');
    const idempotencyHash = crypto.createHmac('sha256', Buffer.from(process.env.INSTITUTE_SESSION_HASH_KEY, 'base64')).update(`${sessionId}:${payload.idempotencyKey}`).digest();
    const [rows] = await connection.execute('SELECT id, course_id, course_name, email_lookup_hash FROM institute_course_enquiries WHERE idempotency_hash=?', [idempotencyHash]);
    const expectedEmail = crypto.createHmac('sha256', Buffer.from(process.env.INSTITUTE_PII_LOOKUP_KEY, 'base64')).update(payload.email.trim().toLowerCase()).digest();
    if (rows.length !== 1 || rows[0].id !== enquiryId || rows[0].course_id !== payload.courseId || rows[0].course_name !== COURSE || !rows[0].email_lookup_hash.equals(expectedEmail)) throw new Error('STAGING_RECORD_NOT_VERIFIED');
  } finally { await connection.end(); }
}

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
