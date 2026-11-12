import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { privateLookupHash, secretHash } from '@/features/education/administration/crypto';
import { isCourseEnquiryStorageReady, recordCourseEnquiry } from '@/features/education/administration/courseEnquiryStore';

const key = Buffer.alloc(32, 9).toString('base64');
const grant = 'G'.repeat(43);
const input = { fullName: 'Test Student', email: 'student@example.com', phone: '+94 77 123 4567', courseId: 'electronics-repair-troubleshooting', subject: 'Course details', courseName: 'Electronics Repair & Troubleshooting', message: 'Please send the course details.', verificationGrant: grant, idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6' };

afterEach(() => vi.unstubAllEnvs());

describe('secure course enquiry persistence', () => {
  beforeEach(() => {
    vi.stubEnv('INSTITUTE_PII_ENCRYPTION_KEY', key); vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', key); vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
  });

  it('consumes a purpose-bound matching grant and stores encrypted PII once', async () => {
    const statements: Array<{ sql: string; values: unknown[] }> = [];
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string, values: unknown[]) => {
      statements.push({ sql, values });
      if (sql.startsWith('SELECT id, notification_status')) return [[], []];
      if (sql.startsWith('SELECT id, contact_lookup_hash')) return [[{ id: 'grant-id', contact_lookup_hash: privateLookupHash(input.email) }], []];
      return [{ affectedRows: 1 }, []];
    }) };
    const stored = await recordCourseEnquiry({ getConnection: async () => connection } as never, input, 'session');
    expect(stored).toMatchObject({ duplicate: false, notificationStatus: 'pending', enquiry: { email: input.email } });
    const insert = statements.find(({ sql }) => sql.startsWith('INSERT INTO institute_course_enquiries'))!;
    expect(Buffer.isBuffer(insert.values[3])).toBe(true);
    expect(String(insert.values[3])).not.toContain(input.fullName);
    expect(statements.some(({ sql }) => sql.includes("purpose = 'course_enquiry'"))).toBe(true);
    expect(statements.find(({ sql }) => sql.startsWith('SELECT id, contact_lookup_hash'))!.values[1]).toEqual(secretHash(`session:${input.courseId}`));
    expect(connection.commit).toHaveBeenCalledOnce();
  });

  it('returns an existing idempotent record before consuming another grant', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT id, notification_status')) return [[{ id: 'existing-enquiry', notification_status: 'notified', request_hash: secretHash(JSON.stringify({ fullName: input.fullName, email: input.email, phone: input.phone, courseId: input.courseId, courseName: input.courseName, subject: input.subject, message: input.message })) }], []];
      throw new Error(`Unexpected SQL: ${sql}`);
    }) };
    await expect(recordCourseEnquiry({ getConnection: async () => connection } as never, input, 'session')).resolves.toMatchObject({ enquiryId: 'existing-enquiry', duplicate: true, notificationStatus: 'notified' });
    expect(connection.execute).toHaveBeenCalledOnce();
  });

  it('rejects missing, expired, consumed and mismatched grants and rolls back storage', async () => {
    for (const email of [null, 'other@example.com']) {
      const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
        if (sql.startsWith('SELECT id, notification_status')) return [[], []];
        if (sql.startsWith('SELECT id, contact_lookup_hash')) return [email ? [{ id: 'grant', contact_lookup_hash: privateLookupHash(email) }] : [], []];
        throw new Error('Unexpected write after invalid grant');
      }) };
      await expect(recordCourseEnquiry({ getConnection: async () => connection } as never, input, 'session')).rejects.toThrow();
      expect(connection.rollback).toHaveBeenCalledOnce();
      expect(connection.commit).not.toHaveBeenCalled();
    }
    await expect(recordCourseEnquiry({ getConnection: vi.fn() } as never, input)).rejects.toThrow();
  });

  it('rejects reuse of an idempotency key for changed enquiry content', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async () => [[{ id: 'existing', notification_status: 'pending', request_hash: secretHash('different request') }], []]) };
    await expect(recordCourseEnquiry({ getConnection: async () => connection } as never, input, 'session')).rejects.toThrow();
    expect(connection.rollback).toHaveBeenCalledOnce();
  });

  it('fails readiness closed until migration 006 structures are present', async () => {
    const files = (await readdir(path.join(process.cwd(), 'database/migrations'))).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
    const migrationRows = await Promise.all(files.map(async (migration_name) => ({ migration_name, sha256: createHash('sha256').update(await readFile(path.join(process.cwd(), 'database/migrations', migration_name))).digest('hex') })));
    const ready = { execute: vi.fn(async (sql: string) => sql.includes('FROM institute_schema_migrations') ? [migrationRows, []] : [[{ enquiry_table: 1, challenge_purpose: 1, grant_purpose: 1 }], []]) };
    const mismatched = { execute: vi.fn(async (sql: string) => sql.includes('FROM institute_schema_migrations') ? [[{ migration_name: files[0], sha256: '0'.repeat(64) }], []] : [[{ enquiry_table: 1, challenge_purpose: 1, grant_purpose: 1 }], []]) };
    const missing = { execute: vi.fn(async () => { throw new Error('missing column'); }) };
    await expect(isCourseEnquiryStorageReady(ready as never)).resolves.toBe(true);
    await expect(isCourseEnquiryStorageReady(mismatched as never)).resolves.toBe(false);
    await expect(isCourseEnquiryStorageReady(missing as never)).resolves.toBe(false);
  });
});

