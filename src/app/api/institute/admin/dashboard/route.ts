import { requireAdminSession } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';
import { listDashboard } from '@/features/education/administration/registrations';
import { getInstituteDatabasePool } from '@/features/education/database/pool';

export const dynamic = 'force-dynamic';
export async function GET() {
  try { const session = await requireAdminSession(['administrator', 'registrar', 'viewer']); return adminJson({ session: { displayName: session.displayName, role: session.role }, ...await listDashboard(getInstituteDatabasePool()) }); }
  catch (error) { return adminJson({ message: error instanceof Error && error.message === 'UNAUTHORIZED' ? 'Authentication required.' : 'Administration is unavailable.' }, error instanceof Error && error.message === 'UNAUTHORIZED' ? 401 : 503); }
}
