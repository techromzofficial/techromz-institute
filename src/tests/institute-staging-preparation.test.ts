import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('staging environment template', () => {
  it('uses blank private credentials and keeps optional features disabled', () => {
    const template = fs.readFileSync(path.join(process.cwd(), '.env.staging.example'), 'utf8').replaceAll('\r\n', '\n');

    for (const key of [
      'INSTITUTE_DB_HOST',
      'INSTITUTE_DB_NAME',
      'INSTITUTE_DB_USER',
      'INSTITUTE_DB_PASSWORD',
      'INSTITUTE_SESSION_HASH_KEY',
      'INSTITUTE_PII_LOOKUP_KEY',
      'INSTITUTE_PII_ENCRYPTION_KEY',
      'INSTITUTE_ENQUIRY_WORKER_SECRET',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM_EMAIL',
    ]) {
      expect(template).toContain(`${key}=\n`);
    }

    for (const feature of ['COURSE_ENQUIRY', 'ADMIN', 'REGISTRATION', 'PAYMENT', 'SEAT_AVAILABILITY']) {
      expect(template).toContain(`INSTITUTE_${feature}_ENABLED=false`);
    }
  });

  it('ignores private staging files while leaving the sanitized template trackable', () => {
    const git = ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'check-ignore', '--no-index'];
    const ignored = execFileSync('git', [...git, '.env.staging.local', 'techromz-institute.env.staging.local'], { encoding: 'utf8' });

    expect(ignored.trim().split(/\r?\n/)).toHaveLength(2);
    expect(spawnSync('git', [...git, '.env.staging.example'], { encoding: 'utf8' }).status).toBe(1);
  });
});
