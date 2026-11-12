import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { stagingIssues, stagingDatabaseIssues, stagingChildEnvironment } from '../../scripts/institute-staging-config.mjs';

// Deliberately fictitious values for pure validation. No transport/pool is created.
function fixture() {
  return {
    NEXT_PUBLIC_APP_URL: 'https://staging.example.com', INSTITUTE_ALLOWED_HOSTS: 'staging.example.com',
    INSTITUTE_ONLY_MODE: 'true', INSTITUTE_ALLOW_INDEXING: 'false', INSTITUTE_ABUSE_PROTECTION_MODE: 'identifier-and-global',
    INSTITUTE_COURSE_ENQUIRY_ENABLED: 'false', INSTITUTE_ADMIN_ENABLED: 'false', INSTITUTE_REGISTRATION_ENABLED: 'false', INSTITUTE_PAYMENT_ENABLED: 'false', INSTITUTE_SEAT_AVAILABILITY_ENABLED: 'false',
    INSTITUTE_DB_HOST: 'staging-db.example.com', INSTITUTE_DB_PORT: '3306', INSTITUTE_DB_NAME: 'fixture_test', INSTITUTE_DB_USER: 'fixture', INSTITUTE_DB_PASSWORD: 'fixture-only', INSTITUTE_DB_SSL: 'true', INSTITUTE_TEST_DATABASE_NAME: 'fixture_test',
    INSTITUTE_SESSION_HASH_KEY: Buffer.alloc(32, 1).toString('base64'), INSTITUTE_PII_LOOKUP_KEY: Buffer.alloc(32, 2).toString('base64'), INSTITUTE_PII_ENCRYPTION_KEY: Buffer.alloc(32, 3).toString('base64'), INSTITUTE_ENQUIRY_WORKER_SECRET: 'W'.repeat(64),
    SMTP_HOST: 'smtp.hostinger.com', SMTP_PORT: '465', SMTP_SECURE: 'true', SMTP_USER: 'fixture@example.com', SMTP_PASS: 'fixture-smtp-only', SMTP_FROM_EMAIL: 'fixture@example.com',
    ENQUIRY_RECIPIENT_EMAIL: 'enrolments@techromzit.com', INSTITUTE_STAGING_TEST_EMAIL: 'fixture@example.com', INSTITUTE_STAGING_APPROVED_RECIPIENTS: 'fixture@example.com,enrolments@techromzit.com',
  };
}
describe('disconnected staging preparation', () => {
  it('validates a complete fixture without inheriting production application settings', () => {
    const env = fixture(); expect(stagingIssues(env)).toEqual([]);
    const child = stagingChildEnvironment(env, { NODE_ENV: 'production', NODE_OPTIONS: 'private-option', SMTP_PASS: 'parent-private-password', INSTITUTE_DB_PASSWORD: 'parent-private-db', HTTP_PROXY: 'private-proxy', INSTITUTE_ADMIN_ENABLED: 'true', PATH: 'fixture-path' });
    expect(child.SMTP_PASS).toBe(env.SMTP_PASS); expect(child.INSTITUTE_DB_PASSWORD).toBe(env.INSTITUTE_DB_PASSWORD);
    expect(child.INSTITUTE_ADMIN_ENABLED).toBe('false'); expect(child.NODE_OPTIONS).toBeUndefined(); expect(child.HTTP_PROXY).toBeUndefined(); expect(child.NEXT_TELEMETRY_DISABLED).toBe('1');
  });
  it.each(['https://techromzit.com', 'https://www.techromzit.com', 'https://techromzit.com.', 'http://staging.example.com', 'https://user:secret@staging.example.com'])('rejects production/unsafe origins before any execution', origin => {
    expect(stagingIssues({ ...fixture(), NEXT_PUBLIC_APP_URL: origin })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'APPROVED_NON_PRODUCTION_HTTPS_ORIGIN_REQUIRED' })]));
  });
  it('rejects production or unconfirmed database identity and unapproved mail routing', () => {
    expect(stagingIssues({ ...fixture(), INSTITUTE_DB_NAME: 'u969738052_institute', INSTITUTE_TEST_DATABASE_NAME: 'u969738052_institute' })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'EXPLICIT_ISOLATED_DATABASE_REQUIRED' })]));
    expect(stagingIssues({ ...fixture(), INSTITUTE_TEST_DATABASE_NAME: '' })).not.toEqual([]);
    expect(stagingIssues({ ...fixture(), INSTITUTE_STAGING_APPROVED_RECIPIENTS: '' })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'EXPLICIT_APPROVED_TEST_RECIPIENT_REQUIRED' })]));
    expect(stagingIssues({ ...fixture(), ENQUIRY_RECIPIENT_EMAIL: 'other@example.com', INSTITUTE_STAGING_APPROVED_RECIPIENTS: 'fixture@example.com,other@example.com' })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'CURRENT_FIXED_NOTIFICATION_ROUTING_REQUIRES_REVIEW' })]));
  });
  it('keeps four unrelated features off and rejects reused keys/unsafe TLS', () => {
    for (const key of ['INSTITUTE_ADMIN_ENABLED', 'INSTITUTE_REGISTRATION_ENABLED', 'INSTITUTE_PAYMENT_ENABLED', 'INSTITUTE_SEAT_AVAILABILITY_ENABLED']) expect(stagingIssues({ ...fixture(), [key]: 'true' })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'MUST_REMAIN_DISABLED' })]));
    const env = fixture();
    expect(stagingIssues({ ...env, INSTITUTE_PII_LOOKUP_KEY: env.INSTITUTE_SESSION_HASH_KEY })).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'DISTINCT_KEYS_REQUIRED' })]));
    expect(stagingIssues({ ...env, SMTP_SECURE: 'false' })).not.toEqual([]);
  });
  it('allows DB-only preparation without SMTP while still refusing the production database', () => {
    const env: Record<string, string> = fixture();
    for (const key of ['SMTP_PASS', 'SMTP_USER', 'INSTITUTE_STAGING_APPROVED_RECIPIENTS', 'NEXT_PUBLIC_APP_URL']) delete env[key];
    expect(stagingDatabaseIssues(env)).toEqual([]);
    expect(stagingIssues(env)).not.toEqual([]);
    expect(stagingDatabaseIssues({ ...env, INSTITUTE_DB_NAME: 'U969738052_INSTITUTE', INSTITUTE_TEST_DATABASE_NAME: 'U969738052_INSTITUTE' })).not.toEqual([]);
  });
  it('does not serialize supplied credentials or unrecognized key names into issue reports', () => {
    const issues = stagingIssues({ ...fixture(), 'private-key-name-do-not-print': 'private-value-do-not-print', SMTP_PASS: 'private-password-do-not-print' });
    const output = JSON.stringify(issues);
    expect(output).not.toContain('private-key-name'); expect(output).not.toContain('private-value'); expect(output).not.toContain('private-password');
  });
  it('runs template preflight disconnected and refuses startup with unprovisioned resources', () => {
    const result = spawnSync(process.execPath, ['scripts/institute-staging.mjs', '--env-file', '.env.staging.example', '--check'], { cwd: process.cwd(), encoding: 'utf8' });
    expect(result.status).toBe(2);
    const report = JSON.parse(result.stdout);
    expect(report).toMatchObject({ status: 'BLOCKED', networkAttempted: false, databaseAttempted: false, emailSent: false });
    expect(report.issues).toEqual(expect.arrayContaining([expect.objectContaining({ setting: 'SMTP_PASS', reason: 'MISSING' })]));
  });
  it('refuses database execution mode with the unprovisioned template before networking', () => {
    const result = spawnSync(process.execPath, ['scripts/institute-staging.mjs', '--env-file', '.env.staging.example', '--db-tests'], { cwd: process.cwd(), encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout)).toMatchObject({ phase: 'preflight', status: 'BLOCKED', databaseAttempted: false, emailSent: false });
  });
  it('keeps the private file patterns ignored while the sanitized template is trackable', () => {
    const git = ['-c', 'safe.directory=D:/Techromz-Institute/techromz-institute', 'check-ignore', '--no-index'];
    expect(execFileSync('git', [...git, '.env.staging.local', 'techromz-institute.env.staging.local'], { encoding: 'utf8' }).trim().split(/\r?\n/)).toHaveLength(2);
    expect(spawnSync('git', [...git, '.env.staging.example'], { encoding: 'utf8' }).status).toBe(1);
    const template = fs.readFileSync(path.join(process.cwd(), '.env.staging.example'), 'utf8');
    expect(template).toContain('SMTP_PASS=\n');
    for (const name of ['COURSE_ENQUIRY', 'ADMIN', 'REGISTRATION', 'PAYMENT', 'SEAT_AVAILABILITY']) expect(template).toContain(`INSTITUTE_${name}_ENABLED=false`);
  });
});
