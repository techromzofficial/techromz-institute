import { describe, expect, it, vi } from 'vitest';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { createContactChallenge, verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { verifyPaymentAndReserveSeat } from '@/features/education/administration/payments';
import { ContactIdentityConflictError, ContactVerificationRequiredError, createRegistration } from '@/features/education/administration/registrations';
import { privateLookupHash } from '@/features/education/administration/crypto';

const key = Buffer.alloc(32, 4).toString('base64');
describe('Phase 3 security remediation', () => {
  it('enables sensitive operations only with the explicit identifier-and-global mode', () => {
    expect(isIdentifierRateLimitMode({} as NodeJS.ProcessEnv)).toBe(false);
    expect(isIdentifierRateLimitMode({ INSTITUTE_ABUSE_PROTECTION_MODE: 'identifier-and-global' } as unknown as NodeJS.ProcessEnv)).toBe(true);
  });

  it('stores shared limiter attempts and rejects at the durable maximum', async () => {
    vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    let count = 0;
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('INSERT INTO institute_rate_limits')) { count += 1; return [{ affectedRows: count === 1 ? 1 : 2 }, []]; }
      if (sql.startsWith('SELECT attempt_count')) return [[{ attempt_count: count, retry_after: 30 }], []];
      throw new Error(sql);
    }) };
    const pool = { getConnection: async () => connection };
    expect((await consumeSharedRateLimit(pool as never, 'client', { scope: 'test', maximum: 2, windowSeconds: 60 })).allowed).toBe(true);
    expect((await consumeSharedRateLimit(pool as never, 'client', { scope: 'test', maximum: 2, windowSeconds: 60 })).allowed).toBe(true);
    expect(await consumeSharedRateLimit(pool as never, 'client', { scope: 'test', maximum: 2, windowSeconds: 60 })).toEqual({ allowed: false, retryAfterSeconds: 30 });
    vi.unstubAllEnvs();
  });

  it('creates a short-lived challenge and consumes it into one opaque grant without logging the token', async () => {
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', key); vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    let stored: unknown[] = []; let consumed = false; const statements: string[] = [];
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string, values: unknown[]) => {
      statements.push(sql);
      if (sql.startsWith('DELETE FROM institute_contact_verification_')) return [{ affectedRows: 0 }, []];
      if (sql.startsWith('UPDATE institute_contact_verification_challenges SET consumed_at=UTC_TIMESTAMP')) return [{ affectedRows: 0 }, []];
      if (sql.startsWith('INSERT INTO institute_contact_verification_challenges')) { stored = values; return [{ affectedRows: 1 }, []]; }
      if (sql.startsWith('SELECT contact_type')) return consumed ? [[], []] : [[{ contact_type: 'email', purpose: 'registration', contact_lookup_hash: stored[3], token_hash: stored[4], requested_network_hash: stored[5], failed_attempts: 0 }], []];
      if (sql.startsWith('UPDATE institute_contact_verification_challenges SET consumed_at')) { consumed = true; return [{ affectedRows: 1 }, []]; }
      if (sql.startsWith('UPDATE institute_contact_verification_grants SET consumed_at')) return [{ affectedRows: 0 }, []];
      if (sql.startsWith('INSERT INTO institute_contact_verification_grants')) return [{ affectedRows: 1 }, []];
      throw new Error(sql);
    }) };
    let delivered = '';
    const pool = { getConnection: async () => connection };
    const challenge = await createContactChallenge(pool as never, { type: 'email', destination: 'learner@example.com', deliver: async ({ token }) => { delivered = token; } });
    const result = await verifyContactChallenge(pool as never, { challengeId: challenge.challengeId, token: delivered });
    expect(result.verified).toBe(true); expect(result.grant).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(statements)).not.toContain(delivered);
    expect((await verifyContactChallenge(pool as never, { challengeId: challenge.challengeId, token: delivered })).verified).toBe(false);
    expect(statements.some((sql) => sql.includes('purpose = ?'))).toBe(true);
    vi.unstubAllEnvs();
  });

  it('rejects a verified fresh email combined with an existing victim phone', async () => {
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', key); vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    const grant = 'G'.repeat(43); const emailHash = privateLookupHash('attacker@example.com');
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT status, registration_opens_at')) return [[{ status: 'open', registration_opens_at: null, registration_deadline_at: new Date(Date.now() + 60_000) }], []];
      if (sql.startsWith('SELECT id, contact_type')) return [[{ id: 'grant', contact_type: 'email', contact_lookup_hash: emailHash }], []];
      if (sql.startsWith('UPDATE institute_contact_verification_grants')) return [{ affectedRows: 1 }, []];
      if (sql.includes('email_lookup_hash')) return [[], []];
      if (sql.includes('phone_lookup_hash')) return [[{ id: 'victim' }], []];
      throw new Error(sql);
    }) };
    await expect(createRegistration({ getConnection: async () => connection } as never, { fullName: 'Attacker', email: 'attacker@example.com', phone: '+94770000000', intakeId: '9b49fd03-36d5-4fe2-98d8-c62eb45a6f14', consent: true, source: 'website', verificationGrant: grant })).rejects.toBeInstanceOf(ContactIdentityConflictError);
    expect(connection.rollback).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
  });

  it('rejects an expired or previously consumed verification grant', async () => {
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', key); vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT status, registration_opens_at')) return [[{ status: 'open', registration_opens_at: null, registration_deadline_at: new Date(Date.now() + 60_000) }], []];
      if (sql.startsWith('SELECT id, contact_type')) return [[], []];
      throw new Error(sql);
    }) };
    await expect(createRegistration({ getConnection: async () => connection } as never, { fullName: 'Learner', email: 'learner@example.com', intakeId: '9b49fd03-36d5-4fe2-98d8-c62eb45a6f14', consent: true, source: 'website', verificationGrant: 'R'.repeat(43) })).rejects.toBeInstanceOf(ContactVerificationRequiredError);
    expect(connection.rollback).toHaveBeenCalledOnce(); vi.unstubAllEnvs();
  });

  it('replays a completed payment/reservation request without allocating another seat', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT student_id')) return [[{ student_id: 'student', intake_id: 'intake', status: 'awaiting_payment' }], []];
      if (sql.startsWith('SELECT id, registration_id')) return [[{ id: 'payment', registration_id: 'registration', amount_minor: 750000, status: 'verified' }], []];
      if (sql.startsWith('SELECT id, status')) return [[{ id: 'reservation', status: 'active', expires_at: new Date(Date.now() + 60_000) }], []];
      throw new Error(`Unexpected SQL: ${sql}`);
    }) };
    await expect(verifyPaymentAndReserveSeat({ getConnection: async () => connection } as never, { registrationId: 'registration', amountMinor: 750000, providerReference: 'manual-receipt-1', actorId: 'admin' })).resolves.toEqual({ paymentId: 'payment', reservationId: 'reservation' });
    expect(connection.execute.mock.calls.some(([sql]) => String(sql).startsWith('INSERT INTO institute_seat_reservations'))).toBe(false);
  });
});
