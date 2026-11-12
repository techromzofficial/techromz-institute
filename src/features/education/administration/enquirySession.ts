import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { secretHash } from './crypto';

const COOKIE = 'institute_enquiry_session';
const SESSION_SECONDS = 20 * 60;
export function enquiryCourseContext(session: string, courseId: string): string {
  return `${session}:${courseId}`;
}
export function readEnquirySession(request: NextRequest): string | undefined {
  const value = request.cookies.get(COOKIE)?.value;
  if (!value) return undefined;
  const [id, expires, signature, extra] = value.split('.');
  if (extra !== undefined || !id || id.length !== 43 || !/^[A-Za-z0-9_-]{43}$/.test(id) || !expires || !/^\d{10,12}$/.test(expires) || !signature || signature.length !== 43 || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return undefined;
  const now = Math.floor(Date.now() / 1000), deadline = Number(expires);
  if (deadline <= now) return undefined;
  try {
    const expected = secretHash(`enquiry.session.v1:${id}:${expires}`).toString('base64url');
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : undefined;
  } catch { return undefined; }
}
export function newEnquirySession(): string { return randomBytes(32).toString('base64url'); }
export function setEnquirySession(response: NextResponse, session: string): void {
  if (session.length !== 43 || !/^[A-Za-z0-9_-]{43}$/.test(session)) throw new Error('INVALID_ENQUIRY_SESSION');
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = secretHash(`enquiry.session.v1:${session}:${expires}`).toString('base64url');
  response.cookies.set(COOKIE, `${session}.${expires}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/institute', maxAge: SESSION_SECONDS });
}
