import { NextRequest } from 'next/server';
import { requireAdminSession, verifyCsrf } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';
import { verifyPaymentAndReserveSeat } from '@/features/education/administration/payments';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';

export async function GET() {
  return adminJson({ available: isInstituteFeatureEnabled('payment') });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isInstituteFeatureEnabled('payment')) return adminJson({ message: 'Payment operations are disabled.' }, 503);
  try {
    const session = await requireAdminSession(['administrator', 'registrar']);
    if (!await verifyCsrf(request)) return adminJson({ message: 'Invalid request.' }, 403);
    const body = await request.json() as { amountMinor?: number; providerReference?: string }; const { id } = await context.params;
    const result = await verifyPaymentAndReserveSeat(getInstituteDatabasePool(), { registrationId: id, amountMinor: body.amountMinor ?? 0, providerReference: body.providerReference, actorId: session.adminUserId });
    return adminJson(result, 201);
  } catch { return adminJson({ message: 'Payment verification or seat reservation could not be completed.' }, 409); }
}
