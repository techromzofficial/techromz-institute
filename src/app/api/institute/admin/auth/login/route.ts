import { NextRequest } from 'next/server';
import { authenticateAdmin, ADMIN_CSRF_COOKIE, ADMIN_SESSION_COOKIE } from '@/features/education/administration/auth';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson, unavailable } from '@/features/education/administration/http';
import { validateLoginInput } from '@/features/education/administration/validation';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  if (!isInstituteFeatureEnabled('admin')) return unavailable();
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Sign-in is temporarily unavailable.' }, 503);
  let body: unknown; try { body = await request.json(); } catch { return adminJson({ message: 'Invalid sign-in request.' }, 400); }
  const input = validateLoginInput(body);
  if (!input.valid) return adminJson({ message: 'Invalid username or password.' }, 401);
  try {
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'admin.login.global', maximum: 50, windowSeconds: 900 }),
      consumeSharedRateLimit(pool, input.username, { scope: 'admin.login.account', maximum: 8, windowSeconds: 900 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Too many sign-in attempts. Try again later.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
    const result = await authenticateAdmin(pool, input.username, input.password, 'ip-independent-global');
    if (!result) return adminJson({ message: 'Invalid username or password.' }, 401);
    const response = adminJson({ authenticated: true });
    const options = { secure: true, sameSite: 'strict' as const, path: '/', expires: result.expiresAt };
    response.cookies.set(ADMIN_SESSION_COOKIE, result.token, { ...options, httpOnly: true });
    response.cookies.set(ADMIN_CSRF_COOKIE, result.csrf, { ...options, httpOnly: false });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMITED') return adminJson({ message: 'Too many sign-in attempts. Try again later.' }, 429, { 'Retry-After': '900' });
    return adminJson({ message: 'Sign-in is temporarily unavailable.' }, 503);
  }
}
