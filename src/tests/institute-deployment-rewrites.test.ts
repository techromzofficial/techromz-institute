import { afterEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config.mjs';

afterEach(() => vi.unstubAllEnvs());

describe('Institute-only deployment rewrites', () => {
  it('disables API proxy rewrites in Institute-only mode', async () => {
    vi.stubEnv('INSTITUTE_ONLY_MODE', 'true');
    expect(await nextConfig.rewrites?.()).toEqual([]);
  });

  it('disables API proxy rewrites by default', async () => {
    vi.stubEnv('INSTITUTE_ONLY_MODE', '');
    expect(await nextConfig.rewrites?.()).toEqual([]);
  });

  it('preserves the existing API proxy in default Retail mode', async () => {
    vi.stubEnv('INSTITUTE_ONLY_MODE', 'false');
    vi.stubEnv('BACKEND_API_URL', 'https://api.example.test/api/');
    expect(await nextConfig.rewrites?.()).toEqual([{ source: '/api/:path*', destination: 'https://api.example.test/api/:path*' }]);
  });
});
