import { APPROVED_SMTP_HOST, APPROVED_SMTP_PORT } from '../src/features/education/administration/smtpRuntime.mjs';

export const PRIVATE_PROJECT_ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local', '.env.development', '.env.development.local', '.env.test', '.env.test.local', '.env.staging', '.env.staging.local'];
export const STAGING_KEYS = new Set([
  'NEXT_PUBLIC_APP_URL', 'INSTITUTE_ALLOWED_HOSTS', 'INSTITUTE_ONLY_MODE', 'INSTITUTE_ALLOW_INDEXING', 'INSTITUTE_ABUSE_PROTECTION_MODE',
  ...['COURSE_ENQUIRY', 'ADMIN', 'REGISTRATION', 'PAYMENT', 'SEAT_AVAILABILITY'].map(name => `INSTITUTE_${name}_ENABLED`),
  ...['HOST', 'PORT', 'NAME', 'USER', 'PASSWORD', 'SSL', 'CONNECTION_LIMIT'].map(name => `INSTITUTE_DB_${name}`),
  'INSTITUTE_TEST_DATABASE_NAME', 'INSTITUTE_SESSION_HASH_KEY', 'INSTITUTE_PII_LOOKUP_KEY', 'INSTITUTE_PII_ENCRYPTION_KEY', 'INSTITUTE_ENQUIRY_WORKER_SECRET',
  ...['HOST', 'PORT', 'SECURE', 'USER', 'PASS', 'FROM_EMAIL'].map(name => `SMTP_${name}`),
  'ENQUIRY_RECIPIENT_EMAIL', 'INSTITUTE_STAGING_TEST_EMAIL', 'INSTITUTE_STAGING_APPROVED_RECIPIENTS',
  'OTP_EXPIRY_MINUTES', 'OTP_MAX_ATTEMPTS', 'OTP_RESEND_COOLDOWN_SECONDS', 'INSTITUTE_TRUSTED_CLIENT_IP_HEADER',
  'INSTITUTE_SECURITY_DIAGNOSTICS', 'INSTITUTE_MARIADB_INTEGRATION', 'INSTITUTE_READ_ONLY_DIAGNOSTIC',
]);
const email = value => typeof value === 'string' && /^[^\s@<>,;:\x00-\x1f\x7f]+@[^\s@<>,;:\x00-\x1f\x7f]+\.[a-z]{2,}$/i.test(value);

// Pure validation: never creates a connection, transport, server, file or secret.
export function stagingIssues(env) {
  const issues = [];
  for (const key of Object.keys(env)) if (!STAGING_KEYS.has(key)) issues.push({ setting: 'UNRECOGNIZED_SETTING', reason: 'UNSUPPORTED_STAGING_SETTING' });
  const required = ['NEXT_PUBLIC_APP_URL', 'INSTITUTE_ALLOWED_HOSTS', 'INSTITUTE_DB_HOST', 'INSTITUTE_DB_PORT', 'INSTITUTE_DB_NAME', 'INSTITUTE_DB_USER', 'INSTITUTE_DB_PASSWORD', 'INSTITUTE_DB_SSL', 'INSTITUTE_TEST_DATABASE_NAME', 'INSTITUTE_ENQUIRY_WORKER_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'ENQUIRY_RECIPIENT_EMAIL', 'INSTITUTE_STAGING_TEST_EMAIL', 'INSTITUTE_STAGING_APPROVED_RECIPIENTS'];
  for (const key of required) if (!env[key]?.trim()) issues.push({ setting: key, reason: 'MISSING' });
  try {
    const url = new URL(env.NEXT_PUBLIC_APP_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || ['techromzit.com', 'www.techromzit.com'].includes(url.hostname.toLowerCase().replace(/\.+$/, ''))) throw new Error();
    const hosts = (env.INSTITUTE_ALLOWED_HOSTS ?? '').split(',').map(s => s.trim().toLowerCase());
    if (!hosts.includes(url.hostname.toLowerCase()) || !hosts.every(h => /^[a-z0-9.-]+$/.test(h))) throw new Error();
  } catch { issues.push({ setting: 'NEXT_PUBLIC_APP_URL/INSTITUTE_ALLOWED_HOSTS', reason: 'APPROVED_NON_PRODUCTION_HTTPS_ORIGIN_REQUIRED' }); }
  if (!env.INSTITUTE_DB_NAME || env.INSTITUTE_DB_NAME !== env.INSTITUTE_DB_NAME.trim() || env.INSTITUTE_TEST_DATABASE_NAME !== env.INSTITUTE_DB_NAME || env.INSTITUTE_DB_NAME.trim().toLowerCase() === 'u969738052_institute') issues.push({ setting: 'INSTITUTE_TEST_DATABASE_NAME', reason: 'EXPLICIT_ISOLATED_DATABASE_REQUIRED' });
  const bounded = (key, fallback, min, max) => {
    const raw = env[key] === undefined ? String(fallback) : env[key];
    if (!/^\d+$/.test(raw) || Number(raw) < min || Number(raw) > max) issues.push({ setting: key, reason: 'INVALID_INTEGER' });
  };
  bounded('INSTITUTE_DB_PORT', 3306, 1, 65535); bounded('INSTITUTE_DB_CONNECTION_LIMIT', 5, 1, 20);
  bounded('OTP_EXPIRY_MINUTES', 5, 1, 10); bounded('OTP_MAX_ATTEMPTS', 5, 1, 5); bounded('OTP_RESEND_COOLDOWN_SECONDS', 60, 60, 900);
  if (!['true', 'false'].includes(env.INSTITUTE_DB_SSL)) issues.push({ setting: 'INSTITUTE_DB_SSL', reason: 'EXPLICIT_TLS_CONFIGURATION_REQUIRED' });
  const keyNames = ['INSTITUTE_SESSION_HASH_KEY', 'INSTITUTE_PII_LOOKUP_KEY', 'INSTITUTE_PII_ENCRYPTION_KEY'];
  const keys = keyNames.map(name => {
    const value = env[name] ?? '', decoded = Buffer.from(value, 'base64');
    if (decoded.length !== 32 || decoded.toString('base64') !== value) issues.push({ setting: name, reason: 'INDEPENDENT_BASE64_32_BYTE_KEY_REQUIRED' });
    return decoded;
  });
  if (keys.some((key, index) => keys.some((other, otherIndex) => index !== otherIndex && key.equals(other)))) issues.push({ setting: 'INSTITUTE_*_KEYS', reason: 'DISTINCT_KEYS_REQUIRED' });
  const secret = env.INSTITUTE_ENQUIRY_WORKER_SECRET ?? '';
  if (secret.length < 32 || secret.length > 256 || /[^\x21-\x7e]/.test(secret)) issues.push({ setting: 'INSTITUTE_ENQUIRY_WORKER_SECRET', reason: 'RANDOM_STAGING_SECRET_REQUIRED' });
  if (env.SMTP_HOST !== APPROVED_SMTP_HOST || Number(env.SMTP_PORT) !== APPROVED_SMTP_PORT || env.SMTP_SECURE !== 'true' || !email(env.SMTP_USER) || env.SMTP_FROM_EMAIL !== env.SMTP_USER) issues.push({ setting: 'SMTP_*', reason: 'SUPPORTED_TLS_ACCOUNT_AND_MATCHING_SENDER_REQUIRED' });
  if (env.INSTITUTE_ONLY_MODE !== 'true' || env.INSTITUTE_ALLOW_INDEXING !== 'false' || env.INSTITUTE_ABUSE_PROTECTION_MODE !== 'identifier-and-global') issues.push({ setting: 'INSTITUTE_MODE_SECURITY', reason: 'SAFE_STAGING_MODES_REQUIRED' });
  for (const name of ['ADMIN', 'REGISTRATION', 'PAYMENT', 'SEAT_AVAILABILITY']) if (env[`INSTITUTE_${name}_ENABLED`] !== 'false') issues.push({ setting: `INSTITUTE_${name}_ENABLED`, reason: 'MUST_REMAIN_DISABLED' });
  if (!['false', 'true'].includes(env.INSTITUTE_COURSE_ENQUIRY_ENABLED)) issues.push({ setting: 'INSTITUTE_COURSE_ENQUIRY_ENABLED', reason: 'EXPLICIT_FLAG_REQUIRED' });
  const approved = (env.INSTITUTE_STAGING_APPROVED_RECIPIENTS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (const name of ['INSTITUTE_STAGING_TEST_EMAIL', 'ENQUIRY_RECIPIENT_EMAIL']) if (!email(env[name]) || !approved.includes(env[name].toLowerCase())) issues.push({ setting: name, reason: 'EXPLICIT_APPROVED_TEST_RECIPIENT_REQUIRED' });
  if (env.ENQUIRY_RECIPIENT_EMAIL && env.ENQUIRY_RECIPIENT_EMAIL !== 'enrolments@techromzit.com') issues.push({ setting: 'ENQUIRY_RECIPIENT_EMAIL', reason: 'CURRENT_FIXED_NOTIFICATION_ROUTING_REQUIRES_REVIEW' });
  return issues;
}

export function stagingDatabaseIssues(env) {
  // DB-only tests use mocked mail delivery and need no mailbox or HTTP origin.
  return stagingIssues(env).filter(issue => issue.setting.startsWith('INSTITUTE_DB_') || [
    'UNRECOGNIZED_SETTING', 'INSTITUTE_TEST_DATABASE_NAME', 'INSTITUTE_SESSION_HASH_KEY', 'INSTITUTE_PII_LOOKUP_KEY',
    'INSTITUTE_PII_ENCRYPTION_KEY', 'INSTITUTE_*_KEYS', 'INSTITUTE_ADMIN_ENABLED', 'INSTITUTE_REGISTRATION_ENABLED',
    'INSTITUTE_PAYMENT_ENABLED', 'INSTITUTE_SEAT_AVAILABILITY_ENABLED',
  ].includes(issue.setting));
}

// No ambient application credentials, NODE_OPTIONS, proxy overrides or mode flags.
export function stagingChildEnvironment(parsed, parent = process.env) {
  const env = {};
  for (const key of ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'ComSpec', 'TEMP', 'TMP', 'USERPROFILE', 'HOME', 'APPDATA', 'LOCALAPPDATA']) if (parent[key] !== undefined) env[key] = parent[key];
  for (const key of STAGING_KEYS) if (parsed[key] !== undefined) env[key] = parsed[key];
  env.NEXT_TELEMETRY_DISABLED = '1';
  return env;
}
