import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isInstituteFeatureEnabled, type InstituteFeature } from '@/features/education/administration/config';
import { readInstituteDatabaseConfig } from '@/features/education/database/config';
import { unverifiedClientIp } from '@/features/education/administration/requestSecurity';
import { isEnquiryWorkerSecretConfigured } from '@/features/education/administration/enquiryWorkerAuth';
import { isOtpPolicyConfigurationReady } from '@/features/education/administration/otpPolicy';
import { execFileSync } from 'node:child_process';

const features: Array<[InstituteFeature, string]> = [
  ['courseEnquiry', 'INSTITUTE_COURSE_ENQUIRY_ENABLED'], ['admin', 'INSTITUTE_ADMIN_ENABLED'],
  ['registration', 'INSTITUTE_REGISTRATION_ENABLED'], ['payment', 'INSTITUTE_PAYMENT_ENABLED'],
  ['seatAvailability', 'INSTITUTE_SEAT_AVAILABILITY_ENABLED'],
];
afterEach(() => vi.unstubAllEnvs());
describe('explicit environment controls', () => {
  it.each(features)('%s is disabled unless its exact flag value is true', (feature, key) => {
    for (const value of [undefined, '', 'false', 'FALSE', 'TRUE', '1', 'yes', ' true ', 'false\\']) {
      expect(isInstituteFeatureEnabled(feature, { NODE_ENV: 'test', [key]: value })).toBe(false);
    }
    expect(isInstituteFeatureEnabled(feature, { NODE_ENV: 'test', [key]: 'true' })).toBe(true);
  });
  it('defaults the database connection limit to five and rejects invalid limits', () => {
    const env = { NODE_ENV: 'test', INSTITUTE_DB_HOST: 'localhost', INSTITUTE_DB_PORT: '3306', INSTITUTE_DB_NAME: 'fixture_test', INSTITUTE_DB_USER: 'fixture', INSTITUTE_DB_PASSWORD: 'fixture-only' } as const;
    expect(readInstituteDatabaseConfig(env).connectionLimit).toBe(5);
    expect(readInstituteDatabaseConfig({ ...env, INSTITUTE_DB_CONNECTION_LIMIT: '' }).connectionLimit).toBe(5);
    for (const value of ['0', '21', '-1', 'five']) expect(() => readInstituteDatabaseConfig({ ...env, INSTITUTE_DB_CONNECTION_LIMIT: value })).toThrow();
  });
  it('uses fail-closed TLS parsing in shared CLI configuration without opening a database', () => {
    const script = `import { readDatabaseConfig } from './scripts/institute-provisioning-common.mjs';
      const base = { INSTITUTE_DB_HOST: 'localhost', INSTITUTE_DB_PORT: '3306', INSTITUTE_DB_NAME: 'fixture_test', INSTITUTE_DB_USER: 'fixture', INSTITUTE_DB_PASSWORD: 'fixture-only' };
      const tls = readDatabaseConfig({ ...base, INSTITUTE_DB_SSL: 'TRUE' }).ssl;
      let rejected = false;
      try { readDatabaseConfig({ ...base, INSTITUTE_DB_SSL: 'invalid' }); } catch { rejected = true; }
      console.log(JSON.stringify({ validatesCertificate: tls.rejectUnauthorized, rejected }));`;
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: process.cwd(), encoding: 'utf8' });
    expect(JSON.parse(result)).toEqual({ validatesCertificate: true, rejected: true });
  });
  it('does not infer a trusted IP from forwarded headers when configuration is absent', () => {
    const request = new NextRequest('https://institute.example.com', { headers: { 'x-forwarded-for': '203.0.113.9', 'x-real-ip': '203.0.113.10' } });
    const env = { NODE_ENV: 'production' } as const;
    expect(unverifiedClientIp(request, env)).toBeNull();
  });
  it('accepts only a single valid IP in the explicitly selected unverified fixture header', () => {
    const env = { NODE_ENV: 'production', INSTITUTE_TRUSTED_CLIENT_IP_HEADER: 'x-fixture-ingress-ip' } as const;
    const request = (value?: string) => new NextRequest('https://institute.example.com', { headers: {
      ...(value ? { 'x-fixture-ingress-ip': value } : {}), 'x-forwarded-for': '198.51.100.20',
    } });
    expect(unverifiedClientIp(request('203.0.113.10'), env)).toBe('203.0.113.10');
    for (const value of [undefined, '203.0.113.10, 198.51.100.2', 'unknown', 'host.example.com']) {
      expect(unverifiedClientIp(request(value), env)).toBeNull();
    }
    expect(unverifiedClientIp(request('203.0.113.10'), { ...env, INSTITUTE_TRUSTED_CLIENT_IP_HEADER: 'invalid header' })).toBeNull();
  });
  it('rejects unusable worker secrets and invalid OTP policy without exposing values', () => {
    for (const secret of ['', 'short', ' '.repeat(32), 'x'.repeat(257), 'x'.repeat(32) + '\n']) {
      expect(isEnquiryWorkerSecretConfigured({ NODE_ENV: 'test', INSTITUTE_ENQUIRY_WORKER_SECRET: secret })).toBe(false);
    }
    expect(isEnquiryWorkerSecretConfigured({ NODE_ENV: 'test', INSTITUTE_ENQUIRY_WORKER_SECRET: 'X'.repeat(32) })).toBe(true);
    expect(isOtpPolicyConfigurationReady({ NODE_ENV: 'test' })).toBe(true);
    expect(isOtpPolicyConfigurationReady({ NODE_ENV: 'test', OTP_EXPIRY_MINUTES: '0' })).toBe(false);
  });
});
