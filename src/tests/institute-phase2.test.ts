import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { decryptPrivateValue, encryptPrivateValue, hashPassword, privateLookupHash, secretHash, verifyPassword } from '@/features/education/administration/crypto';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { validateLoginInput, validateRegistrationInput } from '@/features/education/administration/validation';
import { convertReservationToEnrolment, expireSeatReservations, IntakeUnavailableError } from '@/features/education/database/seatAllocation';
import { NextRequest } from 'next/server';
import { GET as paymentAvailability, POST as verifyPayment } from '@/app/api/institute/admin/registrations/[id]/payment/route';
import { POST as confirmEnrolment } from '@/app/api/institute/admin/registrations/[id]/confirm/route';

const key = Buffer.alloc(32, 7).toString('base64');
const secureEnvironment = { INSTITUTE_PII_ENCRYPTION_KEY: key, INSTITUTE_PII_LOOKUP_KEY: key, INSTITUTE_SESSION_HASH_KEY: key } as unknown as NodeJS.ProcessEnv;
afterEach(() => vi.unstubAllEnvs());

describe('Phase 2 feature safety', () => {
  it('keeps administration, registration, payment, course enquiries and live availability disabled by default', () => {
    expect(isInstituteFeatureEnabled('admin', {} as NodeJS.ProcessEnv)).toBe(false);
    expect(isInstituteFeatureEnabled('registration', {} as NodeJS.ProcessEnv)).toBe(false);
    expect(isInstituteFeatureEnabled('payment', {} as NodeJS.ProcessEnv)).toBe(false);
    expect(isInstituteFeatureEnabled('seatAvailability', {} as NodeJS.ProcessEnv)).toBe(false);
    expect(isInstituteFeatureEnabled('courseEnquiry', {} as NodeJS.ProcessEnv)).toBe(false);
  });

  it('accepts only explicit true for activation', () => {
    expect(isInstituteFeatureEnabled('admin', { INSTITUTE_ADMIN_ENABLED: 'true' } as unknown as NodeJS.ProcessEnv)).toBe(true);
    expect(isInstituteFeatureEnabled('admin', { INSTITUTE_ADMIN_ENABLED: 'TRUE' } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(isInstituteFeatureEnabled('payment', { INSTITUTE_PAYMENT_ENABLED: 'true' } as unknown as NodeJS.ProcessEnv)).toBe(true);
    expect(isInstituteFeatureEnabled('payment', { INSTITUTE_PAYMENT_ENABLED: 'TRUE' } as unknown as NodeJS.ProcessEnv)).toBe(false);
  });

  it('blocks payment-dependent routes even when administration is enabled', async () => {
    vi.stubEnv('INSTITUTE_ADMIN_ENABLED', 'true');
    vi.stubEnv('INSTITUTE_PAYMENT_ENABLED', 'false');
    const request = new NextRequest('https://techromzit.com/api/institute/admin/registrations/registration/payment', {
      method: 'POST',
      headers: { origin: 'https://techromzit.com', 'content-type': 'application/json' },
      body: JSON.stringify({ amountMinor: 750000, providerReference: 'receipt-1' }),
    });
    const context = { params: Promise.resolve({ id: 'registration' }) };
    const paymentResponse = await verifyPayment(request, context);
    expect(paymentResponse.status).toBe(503);
    await expect(paymentResponse.json()).resolves.toEqual({ message: 'Payment operations are disabled.' });

    const confirmResponse = await confirmEnrolment(request, context);
    expect(confirmResponse.status).toBe(503);
    await expect(confirmResponse.json()).resolves.toEqual({ message: 'Payment operations are disabled.' });
  });

  it('exposes payment availability without performing a payment operation', async () => {
    vi.stubEnv('INSTITUTE_PAYMENT_ENABLED', 'false');
    const disabled = await paymentAvailability();
    expect(disabled.status).toBe(200);
    await expect(disabled.json()).resolves.toEqual({ available: false });

    vi.stubEnv('INSTITUTE_PAYMENT_ENABLED', 'true');
    const enabled = await paymentAvailability();
    expect(enabled.status).toBe(200);
    await expect(enabled.json()).resolves.toEqual({ available: true });
  });
});

describe('administrator authentication primitives', () => {
  it('uses salted scrypt password hashes and rejects wrong passwords', async () => {
    const encoded = await hashPassword('a suitably long administrator passphrase');
    expect(encoded).toMatch(/^scrypt\$32768\$8\$1\$/);
    expect(await verifyPassword('a suitably long administrator passphrase', encoded)).toBe(true);
    expect(await verifyPassword('incorrect passphrase', encoded)).toBe(false);
  });

  it('validates bounded login inputs without reflecting credentials', () => {
    expect(validateLoginInput({ username: 'Registrar.One', password: 'secret' })).toEqual({ valid: true, username: 'registrar.one', password: 'secret' });
    expect(validateLoginInput({ username: '../bad', password: 'secret' })).toEqual({ valid: false });
  });

  it('encrypts PII and creates deterministic keyed lookup and session hashes', () => {
    const encrypted = encryptPrivateValue('student@example.com', secureEnvironment);
    expect(encrypted.toString()).not.toContain('student@example.com');
    expect(decryptPrivateValue(encrypted, secureEnvironment)).toBe('student@example.com');
    expect(privateLookupHash('STUDENT@example.com', secureEnvironment)).toEqual(privateLookupHash('student@example.com', secureEnvironment));
    expect(secretHash('opaque-token', secureEnvironment)).toHaveLength(32);
  });
});

describe('registration state inputs', () => {
  const valid = { fullName: 'Approved Learner', email: 'learner@example.com', intakeId: '9b49fd03-36d5-4fe2-98d8-c62eb45a6f14', consent: true, source: 'website', verificationGrant: 'A'.repeat(43) };
  it('requires minimal contact data, consent, an intake UUID and a controlled source', () => {
    expect(validateRegistrationInput(valid).valid).toBe(true);
    expect(validateRegistrationInput({ ...valid, email: '', phone: '' }).valid).toBe(false);
    expect(validateRegistrationInput({ ...valid, consent: false }).valid).toBe(false);
    expect(validateRegistrationInput({ ...valid, source: 'untrusted' }).valid).toBe(false);
    expect(validateRegistrationInput({ ...valid, source: 'whatsapp', verificationGrant: undefined }).valid).toBe(false);
    expect(validateRegistrationInput({ ...valid, source: 'whatsapp', verificationGrant: undefined, identityVerificationReference: 'whatsapp:case-1042' }).valid).toBe(true);
  });
});

describe('seat reservation lifecycle', () => {
  it('expires only active reservations past their deadline', async () => {
    let sql = '';
    const affected = await expireSeatReservations({ execute: async (query: string) => { sql = query; return [{ affectedRows: 3 }, []] as never; } } as never);
    expect(affected).toBe(3); expect(sql).toContain("status = 'active'"); expect(sql).toContain('expires_at <= UTC_TIMESTAMP(6)');
  });

  it('converts a live reservation only when its payment is verified', async () => {
    const statements: string[] = [];
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: async (sql: string) => {
      statements.push(sql);
      if (sql.startsWith('SELECT id, intake_id')) return [[{ id: 'r', intake_id: 'i', student_id: 's', registration_id: 'reg', status: 'active', expires_at: new Date(Date.now() + 60_000) }], []];
      if (sql.startsWith('SELECT status, registration_id')) return [[{ status: 'verified', registration_id: 'reg' }], []];
      return [{ affectedRows: 1 }, []];
    } };
    await convertReservationToEnrolment({ getConnection: async () => connection } as never, { registrationId: 'reg', reservationId: 'r', enrolmentId: 'e', paymentVerificationId: 'p', actorId: 'a' });
    expect(statements.some((sql) => sql.includes('INSERT INTO institute_enrolments'))).toBe(true);
    expect(statements.some((sql) => sql.includes("status = 'converted'"))).toBe(true);
    expect(connection.commit).toHaveBeenCalledOnce();
  });

  it('fails closed for an expired reservation', async () => {
    const connection = { beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), execute: async () => [[{ id: 'r', status: 'active', expires_at: new Date(0) }], []] };
    await expect(convertReservationToEnrolment({ getConnection: async () => connection } as never, { registrationId: 'reg', reservationId: 'r', enrolmentId: 'e', paymentVerificationId: 'p', actorId: 'a' })).rejects.toBeInstanceOf(IntakeUnavailableError);
    expect(connection.rollback).toHaveBeenCalledOnce();
  });
});

describe('MariaDB migration safety', () => {
  it('tracks four InnoDB migrations with no production people, certificates or PostgreSQL syntax', () => {
    const directory = path.join(process.cwd(), 'database/migrations');
    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).sort();
    expect(files).toEqual(['001_institute_core.sql', '002_institute_administration.sql', '003_institute_security_remediation.sql', '004_institute_ip_independent_security.sql', '005_institute_course_enquiries.sql']);
    const sql = files.map((file) => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
    expect(sql).not.toMatch(/\bSERIAL\b|::json|TIMESTAMPTZ|ON CONFLICT/i);
    expect(sql).not.toMatch(/INSERT INTO institute_(students|certificates|admin_users)/i);
    expect(sql).toContain('institute_admin_sessions'); expect(sql).toContain('institute_auth_attempts');
    expect(sql).toContain("ENUM('pending','awaiting_payment','confirmed','cancelled','waitlist')");
  });

  it('uses an advisory lock, checksums and retry-safe CREATE IF NOT EXISTS DDL for partial failures', () => {
    const runner = fs.readFileSync(path.join(process.cwd(), 'scripts/migrate-institute-db.mjs'), 'utf8');
    expect(runner).toContain("GET_LOCK('techromz_institute_migrations'"); expect(runner).toContain('sha256'); expect(runner).toContain('Applied migration was modified');
    for (const file of ['001_institute_core.sql', '002_institute_administration.sql', '003_institute_security_remediation.sql', '004_institute_ip_independent_security.sql', '005_institute_course_enquiries.sql']) expect(fs.readFileSync(path.join(process.cwd(), 'database/migrations', file), 'utf8')).not.toMatch(/CREATE TABLE (?!IF NOT EXISTS)/);
  });
});
