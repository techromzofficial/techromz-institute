import { NextRequest } from 'next/server';
import { requireAdminSession, verifyCsrf } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';
import { updateRegistrationStatus } from '@/features/education/administration/registrations';
import { REGISTRATION_STATUSES } from '@/features/education/administration/validation';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession(['administrator', 'registrar']);
    if (!await verifyCsrf(request)) return adminJson({ message: 'Invalid request.' }, 403);
    const body = await request.json() as { status?: string }; const { id } = await context.params;
    if (!REGISTRATION_STATUSES.includes(body.status as never) || body.status === 'confirmed') return adminJson({ message: 'Invalid status transition.' }, 400);
    await updateRegistrationStatus(getInstituteDatabasePool(), id, body.status as never, session.adminUserId);
    return adminJson({ updated: true });
  } catch (error) { return adminJson({ message: error instanceof Error && error.message === 'UNAUTHORIZED' ? 'Authentication required.' : 'Unable to update registration.' }, error instanceof Error && error.message === 'UNAUTHORIZED' ? 401 : 503); }
}
