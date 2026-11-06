import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('Institute production security headers', () => {
  it('applies a scoped CSP and permissions policy to Institute pages', async () => {
    const entries = await nextConfig.headers?.();
    const institute = entries?.find((entry) => entry.source === '/institute/:path*');
    const headers = new Map(institute?.headers.map((header) => [header.key, header.value]));
    const csp = headers.get('Content-Security-Policy');

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("default-src *");
    expect(headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000');
  });

  it('preserves baseline headers and adds HSTS after HTTPS redirect verification', async () => {
    const entries = await nextConfig.headers?.();
    const global = entries?.find((entry) => entry.source === '/(.*)');
    const headers = new Map(global?.headers.map((header) => [header.key, header.value]));

    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.has('Strict-Transport-Security')).toBe(false);
  });
});
