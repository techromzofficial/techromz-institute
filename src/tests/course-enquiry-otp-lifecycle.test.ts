import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContactChallenge, verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { secretHash } from '@/features/education/administration/crypto';

// Transactional datastore double: serializes transactions and models expiry/consumption.
function database() {
  const rows: Array<Record<string, any>> = [], grants: unknown[][] = [];
  let tail = Promise.resolve();
  return { rows, grants, pool: { getConnection: async () => {
    let unlock: () => void = () => {};
    return {
      beginTransaction: async () => { const prior = tail; tail = new Promise<void>((resolve) => { unlock = resolve; }); await prior; },
      commit: async () => unlock(), rollback: async () => unlock(), release: () => {},
      execute: async (sql: string, values: any[] = []) => {
        if (sql.startsWith('DELETE ') || sql.startsWith('INSERT IGNORE') || sql.startsWith('SELECT contact_hash')) return [[], []];
        if (sql.startsWith('SELECT TIMESTAMPDIFF')) return [rows.filter(r => r.purpose === values[1] && r.contact_lookup_hash.equals(values[2]) && Date.now() - r.created < 900000).reverse().map(r => ({ age_seconds: (Date.now() - r.created) / 1000 })), []];
        if (sql.startsWith('INSERT INTO institute_contact_verification_challenges')) {
          rows.push({ id: values[0], contact_type: values[1], purpose: values[2], contact_lookup_hash: values[3], token_hash: values[4], enquiry_session_hash: values[5], created: Date.now(), consumed: false, failed_attempts: 0 });
        } else if (sql.startsWith('SELECT contact_type')) {
          return [rows.filter(r => r.id === values[0] && r.purpose === values[1] && !r.consumed && Date.now() < r.created + 300000), []];
        } else if (sql.startsWith('UPDATE institute_contact_verification_challenges SET failed_attempts')) {
          rows.find(r => r.id === values[0])!.failed_attempts++;
        } else if (sql.startsWith('UPDATE institute_contact_verification_challenges SET consumed_at')) {
          for (const row of rows) if (values.length === 1 ? row.id === values[0] : row.contact_type === values[0] && row.purpose === values[1] && row.contact_lookup_hash.equals(values[2])) row.consumed = true;
        } else if (sql.startsWith('INSERT INTO institute_contact_verification_grants')) grants.push(values);
        else if (!sql.startsWith('UPDATE institute_contact_verification_grants')) throw new Error('Unexpected test database operation');
        return [{ affectedRows: 1 }, []];
      },
    };
  } } };
}
const session = 'S'.repeat(43);
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-10T00:00:00Z'));
  vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', Buffer.alloc(32, 8).toString('base64'));
  vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', Buffer.alloc(32, 9).toString('base64'));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
async function issue(db: ReturnType<typeof database>) {
  let code = '';
  const result = await createContactChallenge(db.pool as never, { type: 'email', destination: 'student@example.com', purpose: 'course_enquiry', session, deliver: async (mail) => { code = mail.token; } });
  return { ...result, code };
}
function verify(db: ReturnType<typeof database>, challengeId: string, token: string, cookie = session) {
  return verifyContactChallenge(db.pool as never, { challengeId, token, purpose: 'course_enquiry', session: cookie });
}
describe('persistent enquiry OTP lifecycle', () => {
  it('generates six digits, stores a challenge-bound keyed digest and returns no OTP', async () => {
    const db = database(), challenge = await issue(db);
    expect(challenge.code).toMatch(/^\d{6}$/);
    expect(db.rows[0]!.token_hash).toEqual(secretHash(`${challenge.challengeId}:${challenge.code}`));
    expect(db.rows[0]!.token_hash).not.toEqual(Buffer.from(challenge.code));
    const wrongSession = await verify(db, challenge.challengeId, challenge.code, 'other-session');
    expect(wrongSession.verified).toBe(false);
    const result = await verify(db, challenge.challengeId, challenge.code);
    expect(result).toMatchObject({ verified: true, grant: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) });
    expect(await verify(db, challenge.challengeId, challenge.code)).toEqual({ verified: false });
  });
  it('rejects expired codes at the five-minute boundary', async () => {
    const db = database(), challenge = await issue(db);
    vi.advanceTimersByTime(300000);
    expect(await verify(db, challenge.challengeId, challenge.code)).toEqual({ verified: false });
  });
  it('locks out after five incorrect attempts even when the correct code follows', async () => {
    const db = database(), challenge = await issue(db);
    const wrong = challenge.code === '000000' ? '111111' : '000000';
    for (let index = 0; index < 5; index++) expect((await verify(db, challenge.challengeId, wrong)).verified).toBe(false);
    expect((await verify(db, challenge.challengeId, challenge.code)).verified).toBe(false);
    expect(db.grants).toHaveLength(0);
  });
  it('enforces cooldown, invalidates replaced OTPs and allows at most three resends per rolling 15 minutes', async () => {
    const db = database(), first = await issue(db);
    await expect(issue(db)).rejects.toMatchObject({ retryAfterSeconds: 60 });
    vi.advanceTimersByTime(60000); const second = await issue(db);
    expect((await verify(db, first.challengeId, first.code)).verified).toBe(false);
    expect((await verify(db, second.challengeId, second.code)).verified).toBe(true);
    vi.advanceTimersByTime(60000); await issue(db);
    vi.advanceTimersByTime(60000); await issue(db);
    vi.advanceTimersByTime(60000); await expect(issue(db)).rejects.toMatchObject({ retryAfterSeconds: 660 });
  });
  it('issues only one grant for concurrent verification requests', async () => {
    const db = database(), challenge = await issue(db);
    const results = await Promise.all(Array.from({ length: 8 }, () => verify(db, challenge.challengeId, challenge.code)));
    expect(results.filter(result => result.verified)).toHaveLength(1);
    expect(db.grants).toHaveLength(1);
  });
});
