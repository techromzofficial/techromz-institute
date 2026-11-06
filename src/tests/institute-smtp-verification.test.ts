import { describe, expect, it, vi } from 'vitest';
import { createContactChallenge, verifyContactChallenge } from '@/features/education/administration/contactVerification';
import { createSmtpEmailDelivery, getSmtpEmailDelivery, InstituteSmtpConfigurationError, readInstituteSmtpConfig } from '@/features/education/administration/smtp';

const smtpEnvironment = {
  INSTITUTE_SMTP_HOST: 'smtp.hostinger.com', INSTITUTE_SMTP_PORT: '465', INSTITUTE_SMTP_USER: 'enrolments@techromzit.com',
  INSTITUTE_SMTP_PASSWORD: 'mock-only-password', INSTITUTE_SMTP_FROM: 'enrolments@techromzit.com', INSTITUTE_SMTP_SECURE: 'true',
} as unknown as NodeJS.ProcessEnv;
const key = Buffer.alloc(32, 8).toString('base64');

describe('Institute SMTP configuration and delivery', () => {
  it('accepts only the approved TLS endpoint and sender and fails closed without credentials', () => {
    expect(readInstituteSmtpConfig(smtpEnvironment)).toMatchObject({ host: 'smtp.hostinger.com', port: 465, user: 'enrolments@techromzit.com', from: 'enrolments@techromzit.com', secure: true });
    expect(() => readInstituteSmtpConfig({ ...smtpEnvironment, INSTITUTE_SMTP_PASSWORD: '' })).toThrow(InstituteSmtpConfigurationError);
    expect(() => readInstituteSmtpConfig({ ...smtpEnvironment, INSTITUTE_SMTP_FROM: 'attacker@example.com' })).toThrow(InstituteSmtpConfigurationError);
    expect(() => readInstituteSmtpConfig({ ...smtpEnvironment, INSTITUTE_SMTP_SECURE: 'false' })).toThrow(InstituteSmtpConfigurationError);
    expect(getSmtpEmailDelivery({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it('uses certificate-validated TLS and sends only the fixed Institute verification template', async () => {
    const sendMail = vi.fn(async (_message: Record<string, unknown>) => ({ accepted: ['learner@example.com'], rejected: [] }));
    const createTransport = vi.fn(() => ({ sendMail }));
    const deliver = createSmtpEmailDelivery(readInstituteSmtpConfig(smtpEnvironment), createTransport);
    await deliver({ type: 'email', destination: 'Learner@example.com', token: '123456' });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.hostinger.com', port: 465, secure: true, tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' } }));
    const message = sendMail.mock.calls[0]![0];
    expect(message).toMatchObject({ from: 'Techromz Institute <enrolments@techromzit.com>', to: 'learner@example.com', subject: 'Your Techromz Institute verification code' });
    expect(String(message.html)).toContain('123456'); expect(String(message.html)).toContain('10 minutes'); expect(String(message.html)).toContain('info@techromzit.com');
    expect(JSON.stringify(message)).not.toContain('mock-only-password');
  });

  it('fails closed when SMTP does not accept the intended recipient and cannot relay non-email delivery', async () => {
    const rejected = createSmtpEmailDelivery(readInstituteSmtpConfig(smtpEnvironment), () => ({ sendMail: async () => ({ accepted: [], rejected: ['learner@example.com'] }) }));
    await expect(rejected({ type: 'email', destination: 'learner@example.com', token: '123456' })).rejects.toThrow('SMTP_DELIVERY_REJECTED');
    await expect(rejected({ type: 'phone', destination: '+94770000000', token: '123456' })).rejects.toThrow('SMTP_DELIVERY_REJECTED');
  });
});

describe('SMTP-backed challenge lifecycle', () => {
  it('does not commit a challenge until the mocked provider accepts the email', async () => {
    vi.stubEnv('INSTITUTE_PII_LOOKUP_KEY', key); vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async () => [{ affectedRows: 1 }, []]) };
    await expect(createContactChallenge({ getConnection: async () => connection } as never, { type: 'email', destination: 'learner@example.com', deliver: async () => { throw new Error('SMTP unavailable'); } })).rejects.toThrow('SMTP unavailable');
    expect(connection.commit).not.toHaveBeenCalled(); expect(connection.rollback).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
  });

  it('returns the same neutral invalid result for expired, unknown and incorrect codes', async () => {
    vi.stubEnv('INSTITUTE_SESSION_HASH_KEY', key);
    const emptyConnection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async () => [[], []]) };
    const expired = await verifyContactChallenge({ getConnection: async () => emptyConnection } as never, { challengeId: 'expired', token: '111111' });
    const unknown = await verifyContactChallenge({ getConnection: async () => emptyConnection } as never, { challengeId: 'unknown', token: '999999' });
    expect(expired).toEqual({ verified: false }); expect(unknown).toEqual({ verified: false });
    let incremented = false;
    const incorrectConnection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: vi.fn(async (sql: string) => {
      if (sql.startsWith('SELECT contact_type')) return [[{ contact_type: 'email', contact_lookup_hash: Buffer.alloc(32), token_hash: Buffer.alloc(32), requested_network_hash: Buffer.alloc(32), failed_attempts: 0 }], []];
      if (sql.startsWith('UPDATE institute_contact_verification_challenges SET failed_attempts')) { incremented = true; return [{ affectedRows: 1 }, []]; }
      throw new Error(sql);
    }) };
    expect(await verifyContactChallenge({ getConnection: async () => incorrectConnection } as never, { challengeId: 'existing', token: '123456' })).toEqual({ verified: false });
    expect(incremented).toBe(true);
    vi.unstubAllEnvs();
  });
});
