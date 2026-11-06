import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { readInstituteDatabaseConfig, InstituteDatabaseConfigurationError } from '@/features/education/database/config';
import { IntakeUnavailableError, reserveIntakeSeat } from '@/features/education/database/seatAllocation';
import { MySqlCertificateRepository } from '@/features/education/certificates/mysqlRepository';

const configuredEnvironment = {
  INSTITUTE_DB_HOST: '127.0.0.1', INSTITUTE_DB_PORT: '3306', INSTITUTE_DB_NAME: 'institute',
  INSTITUTE_DB_USER: 'instituteapp', INSTITUTE_DB_PASSWORD: 'runtime-only-secret', INSTITUTE_DB_CONNECTION_LIMIT: '5', INSTITUTE_DB_SSL: 'false',
} as unknown as NodeJS.ProcessEnv;

describe('Institute database configuration', () => {
  it('accepts server-only MySQL settings without exposing them through public names', () => {
    expect(readInstituteDatabaseConfig(configuredEnvironment)).toEqual({ host: '127.0.0.1', port: 3306, database: 'institute', user: 'instituteapp', password: 'runtime-only-secret', connectionLimit: 5, ssl: false });
    expect(Object.keys(configuredEnvironment).every((key) => !key.startsWith('NEXT_PUBLIC_'))).toBe(true);
  });

  it('fails closed for missing or invalid credentials and pool values', () => {
    expect(() => readInstituteDatabaseConfig({ ...configuredEnvironment, INSTITUTE_DB_PASSWORD: '' })).toThrow(InstituteDatabaseConfigurationError);
    expect(() => readInstituteDatabaseConfig({ ...configuredEnvironment, INSTITUTE_DB_PORT: '0' })).toThrow(/valid TCP port/i);
    expect(() => readInstituteDatabaseConfig({ ...configuredEnvironment, INSTITUTE_DB_CONNECTION_LIMIT: '100' })).toThrow(/between 1 and 20/i);
    expect(() => readInstituteDatabaseConfig({ ...configuredEnvironment, INSTITUTE_DB_SSL: 'sometimes' })).toThrow(/true or false/i);
  });
});

describe('tracked MySQL migration', () => {
  it('uses InnoDB and contains every required private-domain table and safeguard', () => {
    const sql = fs.readFileSync(path.join(process.cwd(), 'database/migrations/001_institute_core.sql'), 'utf8');
    for (const table of ['students', 'courses', 'course_intakes', 'registrations', 'enrolments', 'seat_reservations', 'payment_verifications', 'attendance', 'practical_assessments', 'certificates', 'audit_logs']) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS institute_${table}`);
    }
    expect((sql.match(/ENGINE=InnoDB/g) ?? []).length).toBeGreaterThanOrEqual(11);
    expect(sql).toMatch(/CHECK \(max_seats BETWEEN 1 AND 30\)/);
    expect(sql).toMatch(/fee_minor BIGINT UNSIGNED NOT NULL/);
    expect(sql).toMatch(/CHECK \(fee_minor > 0\)/);
    expect(sql).toMatch(/UNIQUE \(student_id, course_id\)/);
    expect(sql).toMatch(/attendance_count BETWEEN 5 AND 8/);
    expect(sql).toMatch(/final_assessment_score BETWEEN 60 AND 100/);
    expect(sql).toMatch(/status = 'revoked'[\s\S]*revoked_at IS NOT NULL[\s\S]*revocation_reason IS NOT NULL/);
    expect(sql).not.toMatch(/INSERT INTO institute_(students|certificates)/i);
  });
});

describe('MySQL public certificate repository', () => {
  it('returns only the public certificate projection', async () => {
    const pool = { execute: async (_sql: string, values: unknown[]) => {
      expect(values).toEqual(['TIT-ABCDEFGHJKLMNPQRSTUVWXY2']);
      return [[{ student_name: 'Approved Learner', course_name: 'AI Kickstart', certificate_id: values[0], issued_at: new Date('2026-12-20T00:00:00Z'), status: 'valid', private_note: 'must not escape' }], []];
    } };
    const result = await new MySqlCertificateRepository(pool as never).findPublicByCertificateId('TIT-ABCDEFGHJKLMNPQRSTUVWXY2');
    expect(result).toEqual({ studentName: 'Approved Learner', courseName: 'AI Kickstart', certificateId: 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2', issuedAt: '2026-12-20T00:00:00.000Z', issuerName: 'Techromz Institute', status: 'valid' });
    expect(result).not.toHaveProperty('private_note');
  });

  it('returns null for an unknown exact identifier', async () => {
    const repository = new MySqlCertificateRepository({ execute: async () => [[], []] } as never);
    expect(await repository.findPublicByCertificateId('TIT-333333333333333333333333')).toBeNull();
  });
});

describe('seat-allocation concurrency', () => {
  it('serializes allocations and never exceeds the 30-seat intake limit', async () => {
    let allocated = 0;
    let lock = Promise.resolve();
    const pool = {
      getConnection: async () => {
        let unlock = () => {};
        return {
          beginTransaction: async () => { const previous = lock; lock = new Promise<void>((resolve) => { unlock = resolve; }); await previous; },
          execute: async (sql: string) => {
            if (sql.startsWith('SELECT max_seats')) return [[{ max_seats: 30, status: 'open' }], []];
            if (sql.startsWith('SELECT id, student_id')) return [[], []];
            if (sql.includes('allocated_seats')) return [[{ allocated_seats: allocated }], []];
            if (sql.startsWith('INSERT INTO institute_seat_reservations')) { allocated += 1; return [{ affectedRows: 1 }, []]; }
            throw new Error(`Unexpected SQL: ${sql}`);
          },
          commit: async () => unlock(), rollback: async () => unlock(), release: () => {},
        };
      },
    };
    const attempts = Array.from({ length: 31 }, (_, index) => reserveIntakeSeat(pool as never, { id: `reservation-${index}`, intakeId: 'intake-1', studentId: `student-${index}`, registrationId: `registration-${index}`, expiresAt: new Date('2026-11-27T00:00:00Z') }));
    const results = await Promise.allSettled(attempts);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(30);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect((results.find((result) => result.status === 'rejected') as PromiseRejectedResult).reason).toBeInstanceOf(IntakeUnavailableError);
    expect(allocated).toBe(30);
  });
});
