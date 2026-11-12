import { afterEach, describe, expect, it, vi } from 'vitest';
import { isInstituteSecurityKeyConfigurationReady } from '@/features/education/administration/crypto';

const keys = {
  INSTITUTE_PII_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  INSTITUTE_PII_LOOKUP_KEY: Buffer.alloc(32, 2).toString('base64'),
  INSTITUTE_SESSION_HASH_KEY: Buffer.alloc(32, 3).toString('base64'),
};

describe('institute enquiry security key readiness', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('accepts three independent 32-byte base64 keys', () => {
    expect(isInstituteSecurityKeyConfigurationReady(keys)).toBe(true);
  });

  it('fails closed for missing, malformed, or reused keys', () => {
    expect(isInstituteSecurityKeyConfigurationReady({})).toBe(false);
    expect(isInstituteSecurityKeyConfigurationReady({ ...keys, INSTITUTE_SESSION_HASH_KEY: 'not-a-key' })).toBe(false);
    expect(isInstituteSecurityKeyConfigurationReady({ ...keys, INSTITUTE_SESSION_HASH_KEY: keys.INSTITUTE_PII_LOOKUP_KEY })).toBe(false);
  });
});
