import { NextRequest } from 'next/server';
import { requireAdminSession, verifyCsrf } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';
import { createRegistration, DuplicateRegistrationError } from '@/features/education/administration/registrations';
import { validateRegistrationInput } from '@/features/education/administration/validation';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(['administrator', 'registrar']);
    if (!await verifyCsrf(request)) return adminJson({ message: 'Invalid request.' }, 403);
    const validation = validateRegistrationInput(await request.json());
    if (!validation.valid || validation.value.source === 'website') return adminJson({ message: validation.valid ? 'Use an administrator registration source.' : validation.message }, 400);
    return adminJson(await createRegistration(getInstituteDatabasePool(), validation.value, session.adminUserId), 201);
  } catch (error) { return adminJson({ message: error instanceof DuplicateRegistrationError ? 'An active registration already exists.' : 'Unable to create registration.' }, error instanceof DuplicateRegistrationError ? 409 : 503); }
}
