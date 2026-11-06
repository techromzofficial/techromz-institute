import { NextResponse } from 'next/server';

export function adminJson(body: object, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow', ...headers } });
}

export function unavailable() { return adminJson({ message: 'Institute administration is not activated.' }, 503, { 'Retry-After': '3600' }); }
