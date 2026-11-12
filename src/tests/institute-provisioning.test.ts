import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

describe('Institute controlled provisioning', () => {
  it('tracks exactly nine unique approved course identities, fees and a 30-seat capacity policy', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config/institute-initial-intakes.json'), 'utf8'));
    expect(manifest.courses).toHaveLength(9);
    for (const field of ['id', 'slug', 'intakeId', 'intakeCode']) expect(new Set(manifest.courses.map((item: Record<string, unknown>) => item[field])).size).toBe(9);
    expect(manifest.courses.map((item: { feeMinor: number }) => item.feeMinor)).toEqual([750000, 1500000, 2500000, 750000, 1500000, 2500000, 750000, 1500000, 2500000]);
    expect(JSON.stringify(manifest)).not.toMatch(/student|payment|certificate/i);
  });

  it('runs catalogue validation disconnected by default with all approved deadlines', () => {
    const result = spawnSync(process.execPath, ['scripts/provision-institute-catalogue.mjs'], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } });
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.mode).toBe('dry-run'); expect(report.courses).toBe(9); expect(report.maxSeats).toBe(30); expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.deadlines).toEqual({ '2026-11-27T23:59:59+05:30': 9 });
    expect(result.stderr).toBe('');
  }, 15000);

  it('keeps administrator provisioning dry-run disconnected and password-free', () => {
    const result = spawnSync(process.execPath, ['scripts/provision-institute-admin.mjs', '--mode', 'bootstrap', '--username', 'first.admin', '--display-name', 'First Administrator'], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } });
    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report).toMatchObject({ mode: 'dry-run', operation: 'bootstrap', valid: true, requiresAuthorizationFile: true, passwordSource: 'interactive TTY only', createsPublicEndpoint: false });
    expect(result.stdout).not.toMatch(/passwordHash|secret/i);
  });

  it('requires explicit authorization and interactive password input before apply', () => {
    const result = spawnSync(process.execPath, ['scripts/provision-institute-admin.mjs', '--apply', '--mode', 'bootstrap', '--username', 'first.admin', '--display-name', 'First Administrator'], { cwd: process.cwd(), encoding: 'utf8', env: { NODE_ENV: 'test' } });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--authorization-file is required');
  });
});
