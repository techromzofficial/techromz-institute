import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/features/education/administration/rateLimit', () => ({
  isIdentifierRateLimitMode: () => true,
  consumeSharedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
}));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({}) }));
import { POST } from '@/app/api/institute/certificates/verify/route';

describe('certificate verification API', () => {
  it('rejects malformed certificate IDs without querying a production record', async () => {
    const request = new NextRequest('http://localhost/api/institute/certificates/verify', { method: 'POST', body: JSON.stringify({ certificateId: 'bad-id' }), headers: { 'content-type': 'application/json', host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '192.0.2.10' } });
    const result = await POST(request);
    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ outcome: 'invalid' });
    expect(result.headers.get('cache-control')).toContain('no-store');
  });

  it('fails closed while durable persistence is not configured', async () => {
    const request = new NextRequest('http://localhost/api/institute/certificates/verify', { method: 'POST', body: JSON.stringify({ certificateId: 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2' }), headers: { 'content-type': 'application/json', host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '192.0.2.11' } });
    const result = await POST(request);
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ outcome: 'unavailable', message: 'Certificate verification is temporarily unavailable. Please contact Techromz Institute.' });
    expect(result.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
