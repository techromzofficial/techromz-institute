import { NextRequest, NextResponse } from 'next/server';
import { getCertificateRepository } from '@/features/education/certificates/server';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { validateCertificateId, verifyCertificate } from '@/features/education/certificates/validation';

export const dynamic = 'force-dynamic';

function response(body: object, status: number, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow', ...extraHeaders },
  });
}

export async function POST(request: NextRequest) {
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return response({ outcome: 'unavailable', message: 'Certificate verification is temporarily unavailable. Please contact Techromz Institute.' }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response({ outcome: 'invalid', message: 'Enter a valid Techromz Institute certificate ID.' }, 400);
  }

  const validation = validateCertificateId((body as { certificateId?: unknown })?.certificateId);
  if (!validation.valid) return response({ outcome: 'invalid', message: validation.message }, 400);
  try {
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'certificate.lookup.global', maximum: 300, windowSeconds: 60 }),
      consumeSharedRateLimit(pool, validation.certificateId, { scope: 'certificate.lookup.identifier', maximum: 10, windowSeconds: 60 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return response({ outcome: 'rate_limited', message: 'Too many verification attempts. Please try again shortly.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
  } catch { return response({ outcome: 'unavailable', message: 'Certificate verification is temporarily unavailable. Please contact Techromz Institute.' }, 503); }

  const repository = getCertificateRepository();
  if (!repository) {
    return response({ outcome: 'unavailable', message: 'Certificate verification is not yet available. Please contact Techromz Institute.' }, 503, { 'Retry-After': '3600' });
  }

  try {
    const result = await verifyCertificate(repository, validation.certificateId);
    return response(result, 200);
  } catch {
    return response({ outcome: 'unavailable', message: 'Certificate verification is temporarily unavailable. Please contact Techromz Institute.' }, 503, { 'Retry-After': '300' });
  }
}
