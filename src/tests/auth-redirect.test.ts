import { describe, expect, it } from 'vitest';
import {
  authenticatedDestination,
  sanitizeInternalRedirect,
} from '@/lib/authRedirect';

describe('authenticated redirects', () => {
  it('uses the backend-approved admin destination for a Super Admin', () => {
    expect(authenticatedDestination(
      { role: 'super_admin' },
      '/orders',
      '/admin/dashboard',
    )).toBe('/admin/dashboard');
  });

  it('does not allow an external backend redirect', () => {
    expect(authenticatedDestination(
      { role: 'super_admin' },
      '/orders',
      '//malicious.example/path',
    )).toBe('/admin/dashboard');
  });

  it('preserves a safe intended destination for normal users', () => {
    expect(authenticatedDestination(
      { role: 'buyer' },
      '/orders?status=pending',
    )).toBe('/orders?status=pending');
  });

  it('rejects external intended destinations', () => {
    expect(sanitizeInternalRedirect('https://malicious.example/path'))
      .toBe('/dashboard');
  });
});
