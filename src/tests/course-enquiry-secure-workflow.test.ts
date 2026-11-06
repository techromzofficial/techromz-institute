import { beforeEach, describe, expect, it, vi } from 'vitest';
import { privateLookupHash } from '@/features/education/administration/crypto';
import { isCourseEnquiryStorageReady, markCourseEnquiryNotification, recordCourseEnquiry } from '@/features/education/administration/courseEnquiryStore';

const key = Buffer.alloc(32, 9).toString('base64');
const grant = 'G'.repeat(43);
const input = { fullName: 'Test Student', email: 'student@example.com', phone: '+94 77 123 4567', courseName: 'Electronics Repair & Troubleshooting', message: 'Please send the course details.', verificationGrant: grant, idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6' };

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
    const stored = await recordCourseEnquiry({ getConnection: async () => connection } as never, input);
    expect(stored).toMatchObject({ duplicate: false, notificationStatus: 'pending', enquiry: { email: input.email } });
    const insert = statements.find(({ sql }) => sql.startsWith('INSERT INTO institute_course_enquiries'))!;
    expect(Buffer.isBuffer(insert.values[3])).toBe(true);
    expect(String(insert.values[3])).not.toContain(input.fullName);
    expect(statements.some(({ sql }) => sql.includes("purpose = 'course_enquiry'"))).toBe(true);
    expect(connection.commit).toHaveBeenCalledOnce();
  });

  it('returns an existing idempotent record before consuming another grant', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT id, notification_status')) return [[{ id: 'existing-enquiry', notification_status: 'notified' }], []];
      throw new Error(`Unexpected SQL: ${sql}`);
    }) };
    await expect(recordCourseEnquiry({ getConnection: async () => connection } as never, input)).resolves.toMatchObject({ enquiryId: 'existing-enquiry', duplicate: true, notificationStatus: 'notified' });
    expect(connection.execute).toHaveBeenCalledOnce();
  });

  it('tracks mocked notification success and failure without sending email itself', async () => {
    const execute = vi.fn(async (_sql: string, _values: unknown[]) => [{ affectedRows: 1 }, []]);
    await markCourseEnquiryNotification({ execute } as never, 'enquiry-id', true);
    await markCourseEnquiryNotification({ execute } as never, 'enquiry-id', false);
    expect(execute.mock.calls[0]![1]).toEqual(['notified', true, 'enquiry-id']);
    expect(execute.mock.calls[1]![1]).toEqual(['notification_failed', false, 'enquiry-id']);
  });

  it('fails readiness closed until migration 005 structures are present', async () => {
    const ready = { execute: vi.fn(async () => [[{ enquiry_table: 1, challenge_purpose: 1, grant_purpose: 1 }], []]) };
    const missing = { execute: vi.fn(async () => [[{ enquiry_table: 0, challenge_purpose: 1, grant_purpose: 1 }], []]) };
    await expect(isCourseEnquiryStorageReady(ready as never)).resolves.toBe(true);
    await expect(isCourseEnquiryStorageReady(missing as never)).resolves.toBe(false);
  });
});

