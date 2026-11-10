import 'server-only';
import { randomBytes } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'institute_enquiry_session';
export function readEnquirySession(request: NextRequest): string | undefined {
  const value = request.cookies.get(COOKIE)?.value;
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : undefined;
}
export function newEnquirySession(): string { return randomBytes(32).toString('base64url'); }
export function setEnquirySession(response: NextResponse, session: string): void {
  response.cookies.set(COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/institute', maxAge: 20 * 60 });
}
