import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newEnquirySession, readEnquirySession, setEnquirySession, enquiryCourseContext } from '@/features/education/administration/enquirySession';
import { privateLookupHash, secretHash } from '@/features/education/administration/crypto';
import { consumeSharedRateLimit } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';

const mocks = vi.hoisted(() => ({ getPool: vi.fn(), createChallenge: vi.fn(), verifyChallenge: vi.fn() }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: mocks.getPool }));
vi.mock('@/features/education/administration/smtp', () => ({ getSmtpEmailDelivery: () => vi.fn() }));
vi.mock('@/features/education/administration/courseEnquiry', async original => ({ ...await original<typeof import('@/features/education/administration/courseEnquiry')>(), getCourseEnquiryDelivery: () => vi.fn() }));
vi.mock('@/features/education/administration/contactVerification', () => ({
  createContactChallenge: mocks.createChallenge, verifyContactChallenge: mocks.verifyChallenge, ContactChallengeRateLimitError: class extends Error {},
}));
import { POST as challenge } from '@/app/api/institute/contact-verification/challenge/route';
import { POST as verify } from '@/app/api/institute/contact-verification/verify/route';
import { POST as submit } from '@/app/api/institute/course-enquiries/route';

// Real limiter and enquiry SQL services, with an isolated transactional SQL double.
// This checks routing/identity/crypto behavior; it does not prove MariaDB locking.
function datastore() {
  type Counter = { count: number; expires: number };
  let state = { counters: new Map<string, Counter>(), enquiries: new Map<string, Record<string, any>>(), grant: null as null | { email: Buffer; hash: Buffer; session: Buffer; consumed: boolean } };
  let tail = Promise.resolve();
  const scopes: string[] = [], parameters: unknown[][] = [];
  const db = {
    failureScope: '', malformedCounter: false, scopes, parameters,
    seedGrant(email: string, sessionId: string) { state.grant = { email: privateLookupHash(email), hash: secretHash('G'.repeat(43)), session: secretHash(enquiryCourseContext(sessionId, courseId)), consumed: false }; },
    exhaust(scope: string, subject: string, count: number) { state.counters.set(`${scope}:${secretHash(`${scope}:${subject}`).toString('hex')}`, { count, expires: Date.now() + 3600000 }); },
    enquiryCount: () => state.enquiries.size,
    pool: { getConnection: async () => {
      let unlock = () => {}, snapshot = state;
      return {
        beginTransaction: async () => { const prior = tail; tail = new Promise<void>(resolve => { unlock = resolve; }); await prior; snapshot = { counters: new Map(state.counters), enquiries: new Map(state.enquiries), grant: state.grant }; },
        commit: async () => unlock(), rollback: async () => { state = snapshot; unlock(); }, release: () => {},
        execute: async (sql: string, values: any[] = []) => {
          if (sql.startsWith('INSERT INTO institute_rate_limits')) {
            const [scope, hash, seconds] = values;
            scopes.push(scope); parameters.push(values);
            if (db.failureScope === scope) throw new Error('FIXTURE_STORAGE_UNAVAILABLE');
            const key = `${scope}:${hash.toString('hex')}`, previous = state.counters.get(key);
            state.counters.set(key, previous && previous.expires > Date.now() ? { ...previous, count: previous.count + 1 } : { count: 1, expires: Date.now() + seconds * 1000 });
          } else if (sql.startsWith('SELECT attempt_count')) {
            const row = state.counters.get(`${values[0]}:${values[1].toString('hex')}`)!;
            return [[{ attempt_count: db.malformedCounter ? 0 : row.count, retry_after: Math.max(1, Math.ceil((row.expires - Date.now()) / 1000)) }], []];
          } else if (sql.startsWith('SELECT id, notification_status')) {
            const row = state.enquiries.get(values[0].toString('hex')); return [row ? [row] : [], []];
          } else if (sql.startsWith('SELECT id, contact_lookup_hash')) {
            const grant = state.grant;
            return [grant && !grant.consumed && grant.hash.equals(values[0]) && grant.session.equals(values[1]) ? [{ id: 'fixture-grant', contact_lookup_hash: grant.email }] : [], []];
          } else if (sql.startsWith('INSERT INTO institute_course_enquiries')) {
            state.enquiries.set(values[1].toString('hex'), { id: values[0], request_hash: values[11], notification_status: 'pending' });
          } else if (sql.startsWith('UPDATE institute_contact_verification_grants')) {
            state.grant = state.grant ? { ...state.grant, consumed: true } : null;
          } else throw new Error('UNEXPECTED_FIXTURE_SQL');
          return [{ affectedRows: 1 }, []];
        },
      };
    } },
  };
  return db;
}
const courseId = 'electronics-repair-troubleshooting';
function session() {
  const id = newEnquirySession(), response = new NextResponse(); setEnquirySession(response, id);
  return { id, cookie: response.headers.get('set-cookie')!.split(';')[0]! };
}
function post(body: object, who = session(), ip = '203.0.113.1', extra: Record<string, string> = {}) {
  return new NextRequest('https://techromzit.com/api/institute/test', { method: 'POST', headers: {
    host: 'techromzit.com', origin: 'https://techromzit.com', 'content-type': 'application/json', cookie: who.cookie,
    'x-real-ip': ip, 'x-forwarded-for': '198.51.100.1, 192.0.2.1', ...extra,
  }, body: JSON.stringify(body) });
}
const challengeBody = (email = 'student@example.com') => ({ type: 'email', destination: email, purpose: 'course_enquiry', courseId });
const verifyBody = (id = '8fa27d53-a458-4fba-a295-7103d610f635') => ({ challengeId: id, token: '123456', purpose: 'course_enquiry', courseId });
const enquiry = { fullName: 'Fixture Student', email: 'student@example.com', courseId, subject: 'Course details', message: 'Please send the course details.', verificationGrant: 'G'.repeat(43), idempotencyKey: '2ed25e4a-37c7-4a65-8ad6-4debdff178f6' };
let db: ReturnType<typeof datastore>;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('INSTITUTE_ALLOWED_HOSTS', 'techromzit.com');
  vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'identifier-and-global'); vi.stubEnv('INSTITUTE_COURSE_ENQUIRY_ENABLED', 'true');
  vi.stubEnv('INSTITUTE_ENQUIRY_WORKER_SECRET', 'W'.repeat(32)); vi.stubEnv('INSTITUTE_TRUSTED_CLIENT_IP_HEADER', 'X-Real-IP');
  vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', Buffer.alloc(32, 1).toString('base64'));
  vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', Buffer.alloc(32, 2).toString('base64'));
  vi.stubEnv('INSTITUTE_PII_ENCRYPTION_KEY', Buffer.alloc(32, 3).toString('base64'));
  db = datastore(); mocks.getPool.mockReturnValue(db.pool);
  mocks.createChallenge.mockResolvedValue({ challengeId: '8fa27d53-a458-4fba-a295-7103d610f635' });
  mocks.verifyChallenge.mockResolvedValue({ verified: true, grant: 'G'.repeat(43) });
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe('header spoofing cannot reset primary abuse counters', () => {
  it('keeps the normalized email cooldown across changed IPs and sessions', async () => {
    expect((await challenge(post(challengeBody(' Student@Example.com ')))).status).toBe(202);
    for (const ip of ['203.0.113.2', '198.51.100.55', 'unknown']) expect((await challenge(post(challengeBody(), session(), ip))).status).toBe(429);
    expect(mocks.createChallenge).toHaveBeenCalledOnce();
    expect(db.scopes.filter(s => s === 'contact.challenge.ip')).toHaveLength(1);
    expect(db.parameters.every(values => Buffer.isBuffer(values[1]))).toBe(true);
    expect(JSON.stringify(db.parameters)).not.toContain('student@example.com');
  });
  it('keeps the same signed session limit while attackers rotate emails and IP hints', async () => {
    const who = session();
    for (let index = 0; index < 20; index++) expect((await challenge(post(challengeBody(`fixture${index}@example.com`), who, `203.0.113.${index + 1}`))).status).toBe(202);
    expect((await challenge(post(challengeBody('another@example.com'), who, '198.51.100.9'))).status).toBe(429);
    expect(mocks.createChallenge).toHaveBeenCalledTimes(20);
  });
  it('keeps challenge verification limits across IP changes', async () => {
    const who = session();
    for (let index = 0; index < 6; index++) expect((await verify(post(verifyBody(), who, `203.0.113.${index + 1}`))).status).toBe(200);
    expect((await verify(post(verifyBody(), who, '198.51.100.9'))).status).toBe(429);
    expect(mocks.verifyChallenge).toHaveBeenCalledTimes(6);
  });
  it('enforces a global cap despite new sessions, challenge IDs and IP values', async () => {
    expect((await verify(post(verifyBody()))).status).toBe(200);
    db.exhaust('contact.verify.global', 'global', 300);
    expect((await verify(post(verifyBody('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), session(), '198.51.100.99'))).status).toBe(429);
    expect(mocks.verifyChallenge).toHaveBeenCalledOnce();
  });
  it('keeps the verification session cap across changed challenge IDs and IP values', async () => {
    const who = session(); db.exhaust('contact.verify.session', who.id, 30);
    for (const ip of ['192.0.2.1', '198.51.100.9']) expect((await verify(post(verifyBody('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), who, ip))).status).toBe(429);
    expect(mocks.verifyChallenge).not.toHaveBeenCalled();
  });
  it('does not confuse matching public Host/Origin headers with proof of CDN traversal', async () => {
    const direct = post(challengeBody(), session(), '192.0.2.99', { forwarded: 'for=192.0.2.1;proto=https', 'x-forwarded-host': 'techromzit.com' });
    expect(isAllowedSensitiveRequest(direct)).toBe(true); // Cannot attest the network path.
    db.exhaust('contact.challenge.destination24h', 'student@example.com', 12);
    expect((await challenge(direct)).status).toBe(429);
    expect(mocks.createChallenge).not.toHaveBeenCalled();
  });
  it('allows a legitimate request without a claimed IP, but never bypasses primary checks', async () => {
    vi.stubEnv('INSTITUTE_TRUSTED_CLIENT_IP_HEADER', '');
    expect((await challenge(post(challengeBody()))).status).toBe(202);
    expect(db.scopes[0]).toBe('contact.challenge.global');
    expect(db.scopes.some(s => s.endsWith('.ip'))).toBe(false);
    expect((await challenge(post(challengeBody(), session(), '198.51.100.9'))).status).toBe(429);
  });
  it('fails closed on primary database failure or malformed counter state', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      db.failureScope = 'contact.challenge.global';
      expect((await challenge(post(challengeBody()))).status).toBe(503);
      db.failureScope = ''; db.malformedCounter = true;
      expect((await challenge(post(challengeBody('other@example.com')))).status).toBe(503);
      expect(mocks.createChallenge).not.toHaveBeenCalled();
    } finally { log.mockRestore(); }
  });
  it('returns one persisted enquiry on retry with the same signed session and different IPs', async () => {
    const who = session(); db.seedGrant(enquiry.email, who.id);
    const first = await submit(post(enquiry, who)), second = await submit(post(enquiry, who, '198.51.100.9'));
    expect(first.status).toBe(202); expect(second.status).toBe(200);
    const saved = await first.json(); expect(await second.json()).toMatchObject({ duplicate: true, enquiryId: saved.enquiryId });
    expect(db.enquiryCount()).toBe(1);
    expect(db.scopes.slice(0, 4)).toEqual(['course.enquiry.global', 'course.enquiry.email', 'course.enquiry.mailbox', 'course.enquiry.session']);
  });
  it('does not verify or persist when verification/submission rate-limit storage fails', async () => {
    const who = session(); db.seedGrant(enquiry.email, who.id);
    db.failureScope = 'contact.verify.global';
    expect((await verify(post(verifyBody(), who))).status).toBe(503);
    expect(mocks.verifyChallenge).not.toHaveBeenCalled();
    db.failureScope = 'course.enquiry.global';
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try { expect((await submit(post(enquiry, who))).status).toBe(503); }
    finally { log.mockRestore(); }
    expect(db.enquiryCount()).toBe(0);
  });
  it('cannot bypass email or session enquiry caps by changing only IP hints', async () => {
    const who = session(); db.seedGrant(enquiry.email, who.id);
    db.exhaust('course.enquiry.email', enquiry.email, 3);
    expect((await submit(post(enquiry, who))).status).toBe(429);
    expect((await submit(post(enquiry, who, '198.51.100.99'))).status).toBe(429);
    expect(db.enquiryCount()).toBe(0);
    db = datastore(); mocks.getPool.mockReturnValue(db.pool); db.seedGrant(enquiry.email, who.id);
    db.exhaust('course.enquiry.session', who.id, 6);
    expect((await submit(post(enquiry, who, '192.0.2.9'))).status).toBe(429);
    expect(db.enquiryCount()).toBe(0);
  });
  it('fails before database work when primary mode or session authenticity is invalid', async () => {
    vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'disabled');
    expect((await challenge(post(challengeBody()))).status).toBe(503);
    vi.stubEnv('INSTITUTE_ABUSE_PROTECTION_MODE', 'identifier-and-global');
    expect((await submit(post(enquiry, { id: 'ignored', cookie: `institute_enquiry_session=${'A'.repeat(43)}` }))).status).toBe(400);
    expect(db.scopes).toHaveLength(0);
  });
});

describe('server-issued enquiry cookie and limiter configuration', () => {
  it('authenticates the issued cookie and rejects chosen IDs, tampering and expiry', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-11T00:00:00Z'));
    const who = session(); expect(readEnquirySession(post({}, who))).toBe(who.id);
    expect(readEnquirySession(post({}, { id: 'ignored', cookie: `institute_enquiry_session=${'A'.repeat(43)}` }))).toBeUndefined();
    expect(readEnquirySession(post({}, { ...who, cookie: who.cookie.replace(who.id, 'A'.repeat(43)) }))).toBeUndefined();
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(readEnquirySession(post({}, who))).toBeUndefined();
  });
  it('rejects unsafe limit policies without acquiring a database connection', async () => {
    const getConnection = vi.fn();
    for (const value of [0, NaN, Infinity, -1, 1.5]) await expect(consumeSharedRateLimit({ getConnection } as never, 'global', { scope: 'fixture', maximum: value, windowSeconds: 60 })).rejects.toThrow('INVALID_RATE_LIMIT_CONFIGURATION');
    expect(getConnection).not.toHaveBeenCalled();
  });
});
