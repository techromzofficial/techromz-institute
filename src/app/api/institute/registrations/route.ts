import { NextRequest } from 'next/server';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import { adminJson } from '@/features/education/administration/http';
import { createRegistration, DuplicateRegistrationError, IntakeRegistrationClosedError, RegistrationRateLimitedError } from '@/features/education/administration/registrations';
import { validateRegistrationInput } from '@/features/education/administration/validation';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { consumeSharedRateLimit, isIdentifierRateLimitMode } from '@/features/education/administration/rateLimit';
import { isAllowedSensitiveRequest } from '@/features/education/administration/requestSecurity';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  if (!isInstituteFeatureEnabled('registration')) return adminJson({ message: 'Online registration is not currently available.' }, 503);
  if (!isIdentifierRateLimitMode() || !isAllowedSensitiveRequest(request)) return adminJson({ message: 'Online registration is not currently available.' }, 503);
  let body: unknown; try { body = await request.json(); } catch { return adminJson({ message: 'Invalid registration request.' }, 400); }
  const validation = validateRegistrationInput({ ...(body as object), source: 'website' });
  if (!validation.valid) return adminJson({ message: validation.message }, 400);
  try {
    const pool = getInstituteDatabasePool();
    const limits = await Promise.all([
      consumeSharedRateLimit(pool, 'global', { scope: 'registration.global', maximum: 120, windowSeconds: 3600 }),
      consumeSharedRateLimit(pool, validation.value.email!, { scope: 'registration.email', maximum: 3, windowSeconds: 86_400 }),
      consumeSharedRateLimit(pool, validation.value.verificationGrant!, { scope: 'registration.grant', maximum: 3, windowSeconds: 900 }),
    ]);
    const limited = limits.find((entry) => !entry.allowed);
    if (limited) return adminJson({ message: 'Registration is temporarily unavailable.' }, 429, { 'Retry-After': String(limited.retryAfterSeconds) });
  } catch { return adminJson({ message: 'Registration is temporarily unavailable.' }, 503); }
  try { return adminJson(await createRegistration(getInstituteDatabasePool(), validation.value), 201); }
  catch (error) {
    if (error instanceof DuplicateRegistrationError) return adminJson({ message: 'An active registration already exists for this intake.' }, 409);
    if (error instanceof IntakeRegistrationClosedError) return adminJson({ message: 'Registration is not open for this intake.' }, 409);
    if (error instanceof RegistrationRateLimitedError) return adminJson({ message: 'Registration is temporarily unavailable.' }, 429);
    return adminJson({ message: 'Registration is temporarily unavailable.' }, 503);
  }
}
