import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { classifyDeliveryError, dispatchCourseEnquiries } from '@/features/education/administration/courseEnquiryDelivery';
import { encryptPrivateValue } from '@/features/education/administration/crypto';
import { POST } from '@/app/api/institute/course-enquiries/delivery/route';
import { NextRequest } from 'next/server';

beforeEach(() => vi.stubEnv('INSTITUTE_PII_ENCRYPTION_KEY', Buffer.alloc(32, 8).toString('base64')));
afterEach(() => vi.unstubAllEnvs());
function datastore(attempts = 0) {
  let claimed = false;
  const execute = vi.fn(async (_sql: string, _values?: unknown[]) => [{ affectedRows: 1 }, []]);
  const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
    if (sql.startsWith('SELECT *')) {
      if (claimed) return [[], []];
      claimed = true;
      return [[{ id: 'enquiry-id', delivery_attempts: attempts, full_name_ciphertext: encryptPrivateValue('Student'), email_ciphertext: encryptPrivateValue('student@example.com'), phone_ciphertext: null, course_id: 'ai-course', course_name: 'AI course', subject_ciphertext: encryptPrivateValue('Course details'), message_ciphertext: encryptPrivateValue('Please send details.'), submitted_at: new Date('2026-11-10T00:00:00Z') }], []];
    }
    return [{ affectedRows: 1 }, []];
  }) };
  return { pool: { getConnection: async () => connection, execute }, execute, connection };
}
describe('durable enquiry delivery', () => {
  it('decrypts a persisted enquiry, claims it atomically and records SMTP acceptance', async () => {
    const db = datastore(), send = vi.fn(async () => {});
    expect(await dispatchCourseEnquiries(db.pool as never, send)).toEqual({ acceptedBySmtp: 1, retryScheduled: 0, failed: 0 });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ email: 'student@example.com', subject: 'Course details', courseId: 'ai-course' }), new Date('2026-11-10T00:00:00Z'), 'enquiry-id');
    expect(db.connection.execute).toHaveBeenCalledWith(expect.stringContaining('FOR UPDATE SKIP LOCKED'), [null, null]);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("notification_status='notified'"), ['enquiry-id', expect.any(String)]);
    await dispatchCourseEnquiries(db.pool as never, send);
    expect(send).toHaveBeenCalledOnce();
  });
  it('schedules bounded exponential retries for transient rejection', async () => {
    const db = datastore(2);
    const send = async () => { throw { responseCode: 451 }; };
    expect(await dispatchCourseEnquiries(db.pool as never, send)).toMatchObject({ retryScheduled: 1 });
    expect(db.execute).toHaveBeenLastCalledWith(expect.stringContaining('next_delivery_at=IF'), ['temporary_rejection', true, 240, 'enquiry-id', expect.any(String)]);
    const exhausted = datastore(4);
    expect(await dispatchCourseEnquiries(exhausted.pool as never, send)).toMatchObject({ failed: 1, retryScheduled: 0 });
  });
  it('stops on auth failures and uncertain post-DATA outcomes without persisting raw errors', async () => {
    const db = datastore();
    expect(await dispatchCourseEnquiries(db.pool as never, async () => { throw { code: 'EAUTH', message: 'secret password and enquiry' }; })).toMatchObject({ failed: 1, retryScheduled: 0 });
    expect(JSON.stringify(db.execute.mock.calls)).not.toContain('secret password');
    expect(classifyDeliveryError({ code: 'ETIMEDOUT', command: 'DATA' })).toEqual({ category: 'uncertain_or_configuration', retry: false });
    expect(classifyDeliveryError({ code: 'ETIMEDOUT', command: 'CONN', timeoutType: 'CONNECT_TIMEOUT' })).toEqual({ category: 'connection', retry: true });
    expect(classifyDeliveryError({ code: 'ECONNECTION', command: 'CONN' })).toMatchObject({ retry: false });
    expect(classifyDeliveryError({ code: 'ETIMEDOUT', command: 'CONN', timeoutType: 'SOCKET_TIMEOUT' })).toMatchObject({ retry: false });
    expect(classifyDeliveryError({ responseCode: 550 })).toMatchObject({ retry: false });
  });
  it('does not treat a database failure after SMTP acceptance as a reason to resend', async () => {
    const db = datastore(), send = vi.fn(async () => {});
    db.execute.mockImplementation(async (sql) => { if (sql.includes("notification_status='notified'")) throw new Error('DB down'); return [{ affectedRows: 1 }, []]; });
    await expect(dispatchCourseEnquiries(db.pool as never, send)).rejects.toThrow('DB down');
    expect(send).toHaveBeenCalledOnce();
    expect(db.execute.mock.calls.some(([, values]) => values?.includes('uncertain_or_configuration'))).toBe(false);
  });
  it('requires a strong server-only bearer secret before running a delivery worker', async () => {
    vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', 'W'.repeat(32));
    const response = await POST(new NextRequest('https://techromzit.com/api/institute/course-enquiries/delivery', { method: 'POST', headers: { authorization: 'Bearer wrong' } }));
    expect(response.status).toBe(401);
  });
});
