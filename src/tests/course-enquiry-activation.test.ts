import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('controlled course enquiry activation tooling', () => {
  it('keeps the dry run disconnected and fixed to the approved course and mailbox', () => {
    const output = JSON.parse(execFileSync(process.execPath, ['scripts/course-enquiry-e2e.mjs'], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } }));
    expect(output).toMatchObject({ mode: 'dry-run', course: 'Electronics Repair & Troubleshooting', fixedRecipient: 'enrolments@techromzit.com', requiresInteractiveConfirmation: true, sendsEmail: false });
  });

  it('requires migration checks, endpoint readiness and explicit confirmation before sending', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts/course-enquiry-e2e.mjs'), 'utf8');
    expect(source).toContain('assertDatabaseReady()');
    expect(source).toContain("readinessBody.available !== true");
    expect(source).toContain('SEND ${COURSE} TEST TO ${RECIPIENT}');
    expect(source).toContain("response.status !== 202 || body.accepted !== true");
    expect(source).not.toMatch(/--password|--recipient/);
  });
});
