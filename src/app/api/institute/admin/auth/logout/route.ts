import { NextRequest } from 'next/server';
import { ADMIN_CSRF_COOKIE, ADMIN_SESSION_COOKIE, revokeCurrentSession, verifyCsrf } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';

export async function POST(request: NextRequest) {
  try {
    if (!await verifyCsrf(request)) return adminJson({ message: 'Invalid request.' }, 403);
    await revokeCurrentSession();
  } catch { return adminJson({ message: 'Sign out is temporarily unavailable.' }, 503); }
  const response = adminJson({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', expires: new Date(0), httpOnly: true, secure: true, sameSite: 'strict' });
  response.cookies.set(ADMIN_CSRF_COOKIE, '', { path: '/', expires: new Date(0), secure: true, sameSite: 'strict' });
  return response;
}
